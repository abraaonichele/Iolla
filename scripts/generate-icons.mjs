import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pngToIco from "png-to-ico";

const projectRoot = process.cwd();
const buildDir = path.join(projectRoot, "build");
const iconPngPath = path.join(buildDir, "icon.png");
const iconIcoPath = path.join(buildDir, "icon.ico");

async function main() {
  const iconBuffer = await readFile(iconPngPath);
  const icoBuffer = await pngToIco(iconBuffer);
  await writeFile(iconIcoPath, icoBuffer);
  console.log(`ICO gerado em ${iconIcoPath}`);
}

main().catch((error) => {
  console.error("Falha ao gerar icon.ico:", error);
  process.exitCode = 1;
});
