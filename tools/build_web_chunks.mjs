import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(scriptDir, "..");
const dataDir = path.join(projectDir, "data");
const sourcePath = path.join(dataDir, "base-inicial.json");
const payload = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const chunkSize = 800;

if (!Array.isArray(payload.records) || payload.records.length === 0) {
  throw new Error("A base inicial não contém registros.");
}

for (const file of fs.readdirSync(dataDir)) {
  if (/^base-chunk-\d+\.js$/.test(file)) {
    fs.unlinkSync(path.join(dataDir, file));
  }
}

const bootstrap = [
  "window.BASE_INICIAL_EMBUTIDA = ",
  JSON.stringify({ metadata: payload.metadata || {}, records: [] }),
  ";\n",
].join("");
fs.writeFileSync(path.join(dataDir, "base-embed.js"), bootstrap, "utf8");

for (let offset = 0, part = 1; offset < payload.records.length; offset += chunkSize, part += 1) {
  const records = payload.records.slice(offset, offset + chunkSize);
  const filename = `base-chunk-${String(part).padStart(2, "0")}.js`;
  const rows = records.map((record) => JSON.stringify(record)).join(",\n");
  const content = [
    "window.BASE_INICIAL_EMBUTIDA.records.push(\n",
    rows,
    "\n);\n",
  ].join("");
  fs.writeFileSync(path.join(dataDir, filename), content, "utf8");
}

console.log(`Base web dividida em ${Math.ceil(payload.records.length / chunkSize)} partes.`);
