import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const indexPath = path.join(rootDir, "src", "index.ts");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

if (typeof version !== "string" || version.trim() === "") {
  throw new Error("package.json version is missing or invalid.");
}

const indexSrc = fs.readFileSync(indexPath, "utf8");
const nextIndexSrc = indexSrc.replace(
  /export const VERSION = ['"][^'"]+['"];/,
  `export const VERSION = '${version}';`,
);

if (nextIndexSrc === indexSrc) {
  throw new Error("VERSION constant not found in src/index.ts.");
}

fs.writeFileSync(indexPath, nextIndexSrc);
console.log(`Synced VERSION to ${version}`);
