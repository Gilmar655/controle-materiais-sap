import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputPath = process.argv[2];
if (!outputPath) {
  throw new Error("Informe o caminho de saída do modelo XLSX.");
}

const headers = [
  "Projeto",
  "Descrição do Projeto",
  "Contrato",
  "Código do Material",
  "Descrição do Material",
  "Unidade de Medida",
  "Quantidade Orçada",
  "Quantidade Baixada",
  "Reserva",
  "Código do Movimento",
  "Data do Movimento",
  "Centro",
  "Depósito",
  "Documento SAP",
  "Item SAP",
];

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Importação");
sheet.showGridLines = false;
sheet.getRange("A1:O1").values = [headers];
sheet.getRange("A2:F1000").format.numberFormat = "@";
sheet.getRange("I2:J1000").format.numberFormat = "@";
sheet.getRange("L2:O1000").format.numberFormat = "@";
sheet.getRange("A2:O4").values = [
  ["EXEMPLO-001", "Projeto demonstrativo", "4600000000", "000000000000123456", "Material demonstrativo", "UN", 100, 60, "42000001", "281", new Date("2026-07-24"), "EMPR", "TL52", "700000000001", "10"],
  ["EXEMPLO-001", "Projeto demonstrativo", "4600000000", "000000000000654321", "Outro material", "M", 250, 250, "42000001", "281", new Date("2026-07-24"), "EMPR", "TL52", "700000000002", "20"],
  ["", "", "", "", "", "", null, null, "", "", null, "", "", "", ""],
];
sheet.getRange("A1:O1").format = {
  fill: "#1D4ED8",
  font: { bold: true, color: "#FFFFFF" },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "outside", style: "thin", color: "#1E40AF" },
};
sheet.getRange("A2:O4").format = {
  fill: "#FFFFFF",
  font: { color: "#172033" },
  verticalAlignment: "center",
  borders: {
    insideHorizontal: { style: "thin", color: "#E2E8F0" },
    bottom: { style: "thin", color: "#CBD5E1" },
  },
};
sheet.getRange("G2:H1000").format.numberFormat = "#,##0.00";
sheet.getRange("K2:K1000").format.numberFormat = "dd/mm/yyyy";
sheet.getRange("A1:O4").format.rowHeight = 24;
sheet.getRange("A1:O1").format.rowHeight = 38;
sheet.getRange("A:A").format.columnWidth = 23;
sheet.getRange("B:B").format.columnWidth = 28;
sheet.getRange("C:C").format.columnWidth = 18;
sheet.getRange("D:D").format.columnWidth = 24;
sheet.getRange("E:E").format.columnWidth = 34;
sheet.getRange("F:F").format.columnWidth = 18;
sheet.getRange("G:H").format.columnWidth = 18;
sheet.getRange("I:J").format.columnWidth = 19;
sheet.getRange("K:K").format.columnWidth = 18;
sheet.getRange("L:O").format.columnWidth = 18;
sheet.freezePanes.freezeRows(1);
sheet.tables.add("A1:O4", true, "ModeloImportacao");

const instrucoes = workbook.worksheets.add("Instruções");
instrucoes.showGridLines = false;
instrucoes.getRange("A1:F1").merge();
instrucoes.getRange("A1").values = [["Modelo de importação — Controle de Materiais SAP"]];
instrucoes.getRange("A1:F1").format = {
  fill: "#0F172A",
  font: { bold: true, color: "#FFFFFF", size: 16 },
  rowHeight: 34,
};
instrucoes.getRange("A3:B10").values = [
  ["Orientação", "Descrição"],
  ["Aba principal", "Preencha ou cole os registros na aba Importação."],
  ["Campos mínimos", "Projeto, Código do Material, Quantidade Orçada e Quantidade Baixada."],
  ["Quantidades", "Use valores numéricos; não inclua símbolos ou textos nas células."],
  ["Datas", "Utilize datas válidas do Excel ou o padrão dd/mm/aaaa."],
  ["Códigos", "Mantenha zeros à esquerda em códigos de materiais quando necessário."],
  ["Abas múltiplas", "O dashboard permite selecionar e consolidar mais de uma aba."],
  ["Privacidade", "A importação é processada localmente no navegador."],
];
instrucoes.getRange("A3:B3").format = {
  fill: "#1D4ED8",
  font: { bold: true, color: "#FFFFFF" },
};
instrucoes.getRange("A4:B10").format = {
  fill: "#FFFFFF",
  font: { color: "#172033" },
  wrapText: true,
  verticalAlignment: "center",
};
instrucoes.getRange("A:A").format.columnWidth = 22;
instrucoes.getRange("B:B").format.columnWidth = 70;
instrucoes.getRange("A3:B10").format.rowHeight = 30;

await fs.mkdir(new URL(".", `file://${outputPath}`).pathname, { recursive: true }).catch(() => {});
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const check = await workbook.inspect({
  kind: "table",
  range: "Importação!A1:O4",
  include: "values,formulas",
  tableMaxRows: 6,
  tableMaxCols: 16,
});
console.log(check.ndjson);

const preview = await workbook.render({
  sheetName: "Importação",
  range: "A1:O4",
  scale: 1,
  format: "png",
});
await fs.writeFile(`${outputPath}.preview.png`, new Uint8Array(await preview.arrayBuffer()));
