import { Buffer } from "node:buffer";

import { NextResponse } from "next/server";

import { uploadBufferToGcs } from "@/lib/gcs";

type TestUploadPayload = {
  content?: string;
  objectName?: string;
  contentType?: string;
};

const DEFAULT_CONTENT_TYPE = "text/plain; charset=utf-8";

export async function POST(request: Request) {
  let payload: TestUploadPayload = {};
  try {
    payload = await request.json();
  } catch {
    // Ignore missing/invalid JSON – we fall back to defaults.
  }

  const bucketName =
    process.env.PDF_STORAGE_BUCKET ?? process.env.PDF_STORAGE_GCS_BUCKET ?? process.env.GCS_TEST_BUCKET;
  if (!bucketName) {
    return NextResponse.json(
      { ok: false, error: "No Google Cloud Storage bucket configured (set PDF_STORAGE_BUCKET)." },
      { status: 400 },
    );
  }

  const content = payload.content ?? `Test upload executed at ${new Date().toISOString()}\n`;
  const buffer = Buffer.from(content, "utf-8");
  const objectName = payload.objectName ?? `test/${Date.now()}-${cryptoSuffix()}.txt`;
  const contentType = payload.contentType ?? DEFAULT_CONTENT_TYPE;

  try {
    const result = await uploadBufferToGcs({
      bucket: bucketName,
      objectName,
      buffer,
      contentType,
      cacheControl: "private, max-age=600",
      signedUrlTtlSeconds: 300,
    });

    return NextResponse.json({
      ok: true,
      bucket: result.bucket,
      objectName: result.objectName,
      gcsUri: result.gcsUri,
      signedUrl: result.signedUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Test upload failed", error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

const cryptoSuffix = () => Math.random().toString(16).slice(2, 10);
