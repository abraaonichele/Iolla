import { readFile } from "node:fs/promises";
import path from "node:path";

const tag = process.argv[2];

if (!tag) {
  console.error("Informe a tag para validar, por exemplo: node scripts/assert-tag-version.mjs v1.0.1");
  process.exit(1);
}

const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const expectedTag = `v${packageJson.version}`;

if (tag !== expectedTag) {
  console.error(`A tag ${tag} não corresponde à versão atual do package.json (${expectedTag}).`);
  process.exit(1);
}

console.log(`Tag ${tag} validada com a versão ${packageJson.version}.`);
