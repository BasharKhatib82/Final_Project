import PdfPrinter from "pdfmake";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fonts = {
  NotoSansHebrew: {
    normal: "backend/fonts/NotoSansHebrew-Regular.ttf",
    bold: "backend/fonts/NotoSansHebrew-Bold.ttf",
    italics: "backend/fonts/NotoSansHebrew-Regular.ttf",
    bolditalics: "backend/fonts/NotoSansHebrew-Bold.ttf",
  },
};

const printer = new PdfPrinter(fonts);
const rtl = (s) => "\u202B" + (s ?? "");

export function simpleTablePdfBuffer({ title, headers, rows }) {
  const body = [headers.map((h) => ({ text: rtl(h), bold: true }))];
  rows.forEach((r) => body.push(r.map((c) => rtl(String(c ?? "")))));

  const docDef = {
    pageSize: "A4",
    defaultStyle: { font: "Rubik", fontSize: 10, alignment: "right" },
    content: [
      { text: rtl(title), fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
      {
        table: { headerRows: 1, widths: headers.map(() => "*"), body },
        layout: {
          fillColor: (i) => (i === 0 ? "#eee" : i % 2 ? "#fafafa" : null),
          hLineColor: () => "#ddd",
          vLineColor: () => "#ddd",
        },
      },
    ],
  };

  return new Promise((resolve, reject) => {
    const doc = printer.createPdfKitDocument(docDef);
    const chunks = [];
    doc.on("data", (d) => chunks.push(d));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.end();
  });
}
