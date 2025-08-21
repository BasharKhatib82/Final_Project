import ExcelJS from "exceljs";

export function toExcelBuffer({ title, headers, rows }) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Report");

  ws.addRow([title]).font = { size: 14, bold: true };
  ws.addRow([]);
  ws.addRow(headers).font = { bold: true };
  rows.forEach((r) => ws.addRow(r));

  ws.columns = headers.map(() => ({ width: 22 }));
  return wb.xlsx.writeBuffer(); // Promise<Buffer>
}
