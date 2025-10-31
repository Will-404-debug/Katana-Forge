import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import { put } from "@vercel/blob";

import { uploadBufferToGcs, downloadBufferFromGcs, parseGcsUri, isGcsUri } from "./gcs";

const STORAGE_PROVIDER = (process.env.PDF_STORAGE_PROVIDER ?? "fs").toLowerCase();
const defaultDir = "./storage/quotes";
const storageDir = path.resolve(process.cwd(), process.env.PDF_STORAGE_DIR ?? defaultDir);

let ensureDirPromise: Promise<void> | undefined;

export type StoredFile = {
  absolutePath: string;
  relativePath: string;
  filename: string;
  signedUrl?: string;
};

export const storeQuotePdf = async (input: { quoteNumber: string; buffer: Buffer }) => {
  const { quoteNumber, buffer } = input;
  const filename = buildFileName(quoteNumber);
  const storageKey = buildStorageKey(filename);

  if (isBlobProvider()) {
    const blob = await put(storageKey, buffer, {
      access: "public",
      contentType: "application/pdf",
      token: requireBlobToken(),
    });

    return {
      absolutePath: blob.url,
      relativePath: blob.url,
      filename,
      signedUrl: blob.url,
    } satisfies StoredFile;
  }

  if (isGcsProvider()) {
    const bucketName = resolveConfiguredBucketName();
    if (!bucketName) {
      throw new Error("PDF storage bucket is not configured for Google Cloud Storage");
    }

    const result = await uploadBufferToGcs({
      bucket: bucketName,
      objectName: storageKey,
      buffer,
      contentType: "application/pdf",
      cacheControl: "private, max-age=31536000",
    });

    return {
      absolutePath: result.gcsUri,
      relativePath: result.gcsUri,
      filename,
      signedUrl: result.signedUrl,
    } satisfies StoredFile;
  }

  await ensureDir();
  const absolutePath = path.join(storageDir, filename);
  await fs.writeFile(absolutePath, buffer);

  return {
    absolutePath,
    relativePath: path.relative(process.cwd(), absolutePath),
    filename,
  } satisfies StoredFile;
};

export const loadPdfBuffer = async (relativePath: string) => {
  if (isBlobUrl(relativePath)) {
    const url = resolveBlobUrl(relativePath);
    const response = await fetch(url, buildBlobFetchOptions());
    if (!response.ok) {
      throw new Error(`Failed to download PDF from blob storage (status ${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  if (isBlobProvider()) {
    throw new Error("Stored PDF path is not a valid Vercel Blob URL");
  }

  if (isGcsProvider() || isGcsUri(relativePath)) {
    const { bucket, objectName } = parseGcsUri(relativePath);
    return downloadBufferFromGcs(bucket, objectName);
  }

  const absolutePath = resolveAbsolute(relativePath);
  return fs.readFile(absolutePath);
};

export const resolveAbsolute = (relativePath: string) => {
  if (isGcsProvider() || isGcsUri(relativePath)) {
    throw new Error("resolveAbsolute cannot be used with Google Cloud Storage paths");
  }
  if (isBlobProvider() || isBlobUrl(relativePath)) {
    throw new Error("resolveAbsolute cannot be used with Vercel Blob storage paths");
  }

  const absolute = path.isAbsolute(relativePath)
    ? relativePath
    : path.resolve(process.cwd(), relativePath);
  if (!absolute.startsWith(storageDir)) {
    throw new Error("Attempt to access a file outside of the configured storage directory");
  }
  return absolute;
};

const ensureDir = async () => {
  if (!ensureDirPromise) {
    ensureDirPromise = fs.mkdir(storageDir, { recursive: true }).then(() => undefined);
  }
  return ensureDirPromise;
};

const buildFileName = (quoteNumber: string) => {
  const sanitized = quoteNumber.replace(/[^A-Za-z0-9\-]/g, "_");
  const random = crypto.randomBytes(4).toString("hex");
  return `${sanitized}-${Date.now()}-${random}.pdf`;
};

const buildStorageKey = (filename: string) => {
  const prefix = resolveStoragePrefix();
  if (!prefix) {
    return filename;
  }
  return `${prefix}/${filename}`;
};

const resolveConfiguredBucketName = () =>
  process.env.PDF_STORAGE_BUCKET ?? process.env.PDF_STORAGE_GCS_BUCKET ?? null;

const isGcsProvider = () => STORAGE_PROVIDER === "gcs";
const isBlobProvider = () => STORAGE_PROVIDER === "blob" || STORAGE_PROVIDER === "vercel-blob";

const resolveStoragePrefix = () =>
  process.env.PDF_STORAGE_PREFIX?.replace(/^\//, "").replace(/\/$/, "") ??
  process.env.PDF_STORAGE_GCS_PREFIX?.replace(/^\//, "").replace(/\/$/, "") ??
  null;

const requireBlobToken = () => {
  const token = getBlobToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required when using the blob storage provider");
  }
  return token;
};

const getBlobToken = () =>
  process.env.BLOB_READ_WRITE_TOKEN ??
  process.env.VERCEL_BLOB_READ_WRITE_TOKEN ??
  process.env.BLOB_RW_TOKEN ??
  null;

const isBlobUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
};

const resolveBlobUrl = (value: string) => value;

const buildBlobFetchOptions = (): RequestInit | undefined => {
  const token = getBlobToken();
  if (!token) {
    return undefined;
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
