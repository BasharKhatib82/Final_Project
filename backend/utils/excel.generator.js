import ExcelJS from "exceljs";

export function buildExcelBuffer(def, rows) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  ws.addRow([def.title]).font = { size: 14, bold: true };
  ws.addRow([]);
  ws.addRow(def.table.headers).font = { bold: true };

  rows.forEach((r) => ws.addRow(def.table.columns.map((fn) => fn(r))));
  ws.columns = def.table.headers.map(() => ({ width: 22 }));

  return wb.xlsx.writeBuffer(); // Promise<Buffer>
}
