import PdfPrinter from "pdfmake";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dayjs from "dayjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Use Noto Sans Hebrew (preferred), fallback to core fonts if missing ---
const notoRegular = path.resolve(
  __dirname,
  "../fonts/NotoSansHebrew-Regular.ttf"
);
const notoBold = path.resolve(__dirname, "../fonts/NotoSansHebrew-Bold.ttf");

let fonts;
if (fs.existsSync(notoRegular) && fs.existsSync(notoBold)) {
  fonts = {
    NotoSansHebrew: {
      normal: notoRegular,
      bold: notoBold,
      italics: notoRegular,
      bolditalics: notoBold,
    },
  };
  console.log("[pdfmake] Using Noto Sans Hebrew fonts:", notoRegular, notoBold);
} else {
  fonts = {
    Core: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };
  console.warn(
    "[pdfmake] NotoSansHebrew *.ttf not found, falling back to core Helvetica.",
    {
      expected: { notoRegular, notoBold },
    }
  );
}

const printer = new PdfPrinter(fonts);
const rtl = (s) => "\u202B" + String(s ?? "");

export function buildPdfBuffer(def, rows, { filters = {}, meta = {} } = {}) {
  const body = [
    def.table.headers.map((h) => ({ text: rtl(h), style: "th" })),
    ...rows.map((r) => def.table.columns.map((fn) => rtl(fn(r)))),
  ];

  const now = dayjs().format("DD/MM/YYYY HH:mm");

  const docDefinition = {
    pageSize: "A4",
    pageMargins: [40, 100, 40, 50],
    defaultStyle: {
      font: fonts.NotoSansHebrew ? "NotoSansHebrew" : "Core",
      fontSize: 10,
      alignment: "right",
    },
    header: [
      {
        columns: [
          { text: rtl(def.title), style: "title", alignment: "right" },
          {
            text: rtl(meta.brand || "Respondify CRM"),
            alignment: "left",
            style: "subtle",
          },
        ],
        margin: [40, 20, 40, 0],
      },
      {
        columns: [
          {
            text: rtl(`תאריך הפקה: ${now}`),
            alignment: "right",
            style: "subtle",
          },
          { text: "" },
        ],
        margin: [40, 4, 40, 8],
      },
      {
        style: "filtersCard",
        table: {
          widths: ["*", "*", "*"],
          body: [
            [
              { text: rtl(`מ־תאריך: ${filters.from || "-"}`) },
              { text: rtl(`עד תאריך: ${filters.to || "-"}`) },
              { text: rtl(`חיפוש: ${filters.q || "-"}`) },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0,
          vLineWidth: () => 0,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        },
        margin: [40, 0, 40, 10],
      },
    ],
    footer: (currentPage, pageCount) => ({
      margin: [40, 0, 40, 20],
      columns: [
        {
          text: rtl(meta.footerNote || ""),
          alignment: "right",
          style: "subtle",
        },
        {
          text: `${currentPage} / ${pageCount}`,
          alignment: "left",
          style: "subtle",
        },
      ],
    }),
    content: [
      {
        table: {
          headerRows: 1,
          widths: def.table.widths || ["*", "*", "*"],
          body,
        },
        layout: {
          fillColor: (rowIndex) =>
            rowIndex === 0 ? "#eeeeee" : rowIndex % 2 ? "#fafafa" : null,
          hLineColor: () => "#dddddd",
          vLineColor: () => "#dddddd",
        },
      },
    ],
    styles: {
      title: { fontSize: 18, bold: true },
      subtle: { color: "#666" },
      th: { bold: true },
      filtersCard: { fillColor: "#f6f7fb" },
    },
  };

  return new Promise((resolve, reject) => {
    try {
      const doc = printer.createPdfKitDocument(docDefinition);
      const chunks = [];
      doc.on("data", (d) => chunks.push(d));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    } catch (e) {
      console.error("[pdfmake] build error:", e);
      reject(e);
    }
  });
}
