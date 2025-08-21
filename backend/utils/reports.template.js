import Handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// נטען תמיד יחסית לתיקיה utils -> ../templates/report.hbs
const tplPath = path.resolve(__dirname, "../templates/report.hbs");
const tpl = fs.readFileSync(tplPath, "utf8");
const compile = Handlebars.compile(tpl);

export function renderHTML({ def, rows, filters }) {
  const tableRows = rows.map((r) => def.table.columns.map((fn) => fn(r)));
  return compile({
    title: def.title,
    headers: def.table.headers,
    rows: tableRows,
    filters: filters || {},
    meta: { brand: "Respondify CRM" },
    generatedAt: new Date().toLocaleString("he-IL"),
  });
}
