import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

const tpl = fs.readFileSync(
  path.resolve("backend/templates/report.hbs"),
  "utf8"
);
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
