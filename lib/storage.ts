import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const defaultDir = "./storage/quotes";
const storageDir = path.resolve(process.cwd(), process.env.PDF_STORAGE_DIR ?? defaultDir);

let ensureDirPromise: Promise<void> | undefined;

export type StoredFile = {
  absolutePath: string;
  relativePath: string;
  filename: string;
};

export const storeQuotePdf = async (input: { quoteNumber: string; buffer: Buffer }) => {
  const { quoteNumber, buffer } = input;
  await ensureDir();

  const filename = buildFileName(quoteNumber);
  const absolutePath = path.join(storageDir, filename);
  await fs.writeFile(absolutePath, buffer);

  return {
    absolutePath,
    relativePath: path.relative(process.cwd(), absolutePath),
    filename,
  } satisfies StoredFile;
};

export const loadPdfBuffer = async (relativePath: string) => {
  const absolutePath = resolveAbsolute(relativePath);
  return fs.readFile(absolutePath);
};

export const resolveAbsolute = (relativePath: string) => {
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
