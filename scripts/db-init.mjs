import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prismaArgsApply = [
  "prisma",
  "db",
  "execute",
  "--file",
  "prisma/migrations/0001_init/migration.sql",
  "--schema",
  "prisma/schema.prisma",
];

const prismaArgsResolve = ["prisma", "migrate", "resolve", "--applied", "0001_init"];

runPrisma(prismaArgsApply);

const resolveResult = runPrisma(prismaArgsResolve, { allowAlreadyApplied: true });

if (resolveResult === "skipped") {
  process.stdout.write("[db:init] migration already recorded, skipping resolve step.\n");
}

function runPrisma(args, options = {}) {
  const command = `npx ${args.join(" ")}`;
  const result = spawnSync(command, [], {
    cwd: resolve(__dirname, ".."),
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
    shell: true,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status === 0) {
    return result;
  }

  if (options.allowAlreadyApplied && isAlreadyAppliedError(result)) {
    return "skipped";
  }

  process.exit(result.status ?? 1);
}

function isAlreadyAppliedError(result) {
  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  return output.includes("P3008");
}
