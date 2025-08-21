import express from "express";
import { ENTITIES } from "../utils/reports.schema.js";
import { fetchRows } from "../utils/reports.service.js";
import { renderHTML } from "../utils/reports.template.js";
import { htmlToPdfBuffer } from "../utils/pdf.generator.js";
import { simpleTablePdfBuffer } from "../utils/pdf.fallback.js";
import { toExcelBuffer } from "../utils/excel.generator.js";

const router = express.Router();

router.use("/:entity", (req, res, next) => {
  const def = ENTITIES[req.params.entity];
  if (!def) return res.status(404).json({ error: "Unknown entity" });
  // TODO: חבר ל-RBAC אמיתי
  // if (!req.user?.permissions?.can_view_reports) return res.status(403).json({ error: "FORBIDDEN" });
  next();
});

router.get("/:entity/preview", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows }) => {
      if (err) {
        console.error("[Reports][Preview] DB_ERROR:", err);
        return res
          .status(500)
          .json({ error: "DB_ERROR", details: err.code || String(err) });
      }
      res.json({ rows, total: rows.length });
    }
  );
});

router.get("/:entity/export/excel", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows, def }) => {
      if (err) {
        console.error("[Reports][Excel] DB_ERROR:", err);
        return res.status(500).json({ error: "DB_ERROR" });
      }
      const table = rows.map((r) => def.table.columns.map((fn) => fn(r)));
      toExcelBuffer({
        title: def.title,
        headers: def.table.headers,
        rows: table,
      })
        .then((buf) => {
          res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${req.params.entity}-report.xlsx"`
          );
          res.end(Buffer.from(buf));
        })
        .catch((e) => {
          console.error("[Reports][Excel] XLSX_ERROR:", e);
          res.status(500).json({ error: "XLSX_ERROR" });
        });
    }
  );
});

router.get("/:entity/export/pdf", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows, def }) => {
      if (err) {
        /* ... */
      }

      const html = renderHTML({ def, rows, filters: req.query });

      htmlToPdfBuffer(html)
        .then((buf) => {
          /* success */
        })
        .catch(async (e) => {
          console.warn("[Reports][PDF] falling back to pdfmake:", e?.message);
          const table = rows.map((r) => def.table.columns.map((fn) => fn(r)));
          const buf = await simpleTablePdfBuffer({
            title: def.title,
            headers: def.table.headers,
            rows: table,
          });
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${req.params.entity}-report.pdf"`
          );
          res.end(buf);
        });
    }
  );
});

export default router;
