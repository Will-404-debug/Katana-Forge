import { Storage, type StorageOptions } from "@google-cloud/storage";

type ServiceAccountKey = {
  client_email: string;
  private_key: string;
  project_id?: string;
  [key: string]: unknown;
};

type UploadParams = {
  bucket: string;
  objectName: string;
  buffer: Buffer;
  contentType: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
  signedUrlTtlSeconds?: number;
};

type SignedUrlParams = {
  bucket: string;
  objectName: string;
  signedUrlTtlSeconds?: number;
};

type ParsedGcsUri = {
  bucket: string;
  objectName: string;
};

const DEFAULT_SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

let cachedClient: Storage | null = null;
let cachedCredentials: ServiceAccountKey | null | undefined;

export const GCS_URI_SCHEME = "gcs://";

export const getGcsClient = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const credentials = loadServiceAccountKey();
  const options: StorageOptions = {
    projectId: process.env.GCP_PROJECT_ID ?? credentials?.project_id,
    credentials: credentials ?? undefined,
  };

  cachedClient = new Storage(options);
  return cachedClient;
};

export const getGcsBucket = (bucketName: string) => {
  if (!bucketName) {
    throw new Error("Google Cloud Storage bucket name is not configured");
  }
  return getGcsClient().bucket(bucketName);
};

export const uploadBufferToGcs = async (params: UploadParams) => {
  const { bucket, objectName, buffer, contentType, cacheControl, metadata, signedUrlTtlSeconds } = params;

  const targetBucket = getGcsBucket(bucket);
  const file = targetBucket.file(objectName);
  await file.save(buffer, {
    resumable: false,
    contentType,
    metadata: {
      cacheControl: cacheControl ?? "private, max-age=31536000",
      ...metadata,
    },
  });

  const signedUrl = await generateSignedUrl({ bucket, objectName, signedUrlTtlSeconds });

  return {
    bucket,
    objectName,
    gcsUri: buildGcsUri(bucket, objectName),
    signedUrl,
  };
};

export const downloadBufferFromGcs = async (bucket: string, objectName: string) => {
  const file = getGcsBucket(bucket).file(objectName);
  const [data] = await file.download();
  return data;
};

export const generateSignedUrl = async (params: SignedUrlParams) => {
  const { bucket, objectName } = params;
  const ttl = params.signedUrlTtlSeconds ?? resolveSignedUrlTtlSeconds();
  const file = getGcsBucket(bucket).file(objectName);
  const expires = new Date(Date.now() + ttl * 1000);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires,
  });
  return url;
};

export const buildGcsUri = (bucket: string, objectName: string) => `${GCS_URI_SCHEME}${bucket}/${objectName}`;

export const isGcsUri = (value: string) => value.startsWith(GCS_URI_SCHEME);

export const parseGcsUri = (value: string): ParsedGcsUri => {
  if (isGcsUri(value)) {
    const withoutScheme = value.slice(GCS_URI_SCHEME.length);
    const separatorIndex = withoutScheme.indexOf("/");
    if (separatorIndex === -1) {
      throw new Error("Invalid GCS URI – missing object path");
    }
    const bucket = withoutScheme.slice(0, separatorIndex);
    const objectName = withoutScheme.slice(separatorIndex + 1);
    if (!bucket || !objectName) {
      throw new Error("Invalid GCS URI – bucket or object name is empty");
    }
    return { bucket, objectName };
  }

  const bucketName = resolveConfiguredBucketName();
  if (!bucketName) {
    throw new Error("Google Cloud Storage bucket name is not configured");
  }
  return { bucket: bucketName, objectName: value.replace(/^\/+/, "") };
};

const resolveConfiguredBucketName = () =>
  process.env.PDF_STORAGE_BUCKET ?? process.env.PDF_STORAGE_GCS_BUCKET ?? null;

const resolveSignedUrlTtlSeconds = () => {
  const raw = process.env.GCS_SIGNED_URL_TTL_SECONDS;
  if (!raw) {
    return DEFAULT_SIGNED_URL_TTL_SECONDS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error("GCS_SIGNED_URL_TTL_SECONDS must be a positive integer");
  }
  return parsed;
};

const loadServiceAccountKey = () => {
  if (cachedCredentials !== undefined) {
    if (cachedCredentials === null) {
      throw new Error(
        "Google Cloud credentials are not configured. Set GCS_SERVICE_ACCOUNT_KEY_BASE64 with the base64-encoded service account JSON.",
      );
    }
    return cachedCredentials;
  }

  const base64Value = process.env.GCS_SERVICE_ACCOUNT_KEY_BASE64;
  if (base64Value) {
    const decoded = parseJsonCandidate(base64Value, ["base64", "base64url"]);
    cachedCredentials = coercePrivateKey(decoded);
    return cachedCredentials;
  }

  const fallback =
    process.env.GCS_SERVICE_ACCOUNT_KEY ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON ??
    process.env.GCP_SERVICE_ACCOUNT_KEY;

  if (!fallback) {
    cachedCredentials = null;
    throw new Error(
      "Google Cloud credentials are not configured. Set GCS_SERVICE_ACCOUNT_KEY_BASE64 with the base64-encoded service account JSON.",
    );
  }

  const parsed = parseJsonCandidate(fallback, ["utf8", "base64", "base64url"]);
  cachedCredentials = coercePrivateKey(parsed);
  return cachedCredentials;
};

const coercePrivateKey = (credentials: ServiceAccountKey) => {
  if (!credentials?.client_email || !credentials?.private_key) {
    throw new Error("Invalid Google Cloud service account JSON – missing client_email or private_key");
  }
  credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
  return credentials;
};

const parseJsonCandidate = (value: string, encodings: Array<BufferEncoding | "base64url">) => {
  for (const encoding of encodings) {
    const candidate = decode(value, encoding);
    try {
      return JSON.parse(candidate) as ServiceAccountKey;
    } catch {
      // Continue
    }
  }
  throw new Error("Unable to parse Google Cloud service account key from provided environment variable");
};

const decode = (value: string, encoding: BufferEncoding | "base64url") => {
  if (encoding === "base64url") {
    const normalised = value.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(normalised, "base64").toString("utf-8");
  }
  if (encoding === "utf8") {
    return value;
  }
  return Buffer.from(value, encoding).toString("utf-8");
};

export const ensureGcsWritable = async (bucketName: string) => {
  const bucket = getGcsBucket(bucketName);
  await bucket.exists(); // Will throw if credentials are invalid.
};
