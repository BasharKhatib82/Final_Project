import express from "express";
import { ENTITIES } from "../utils/reports.schema.js";
import { fetchRows } from "../utils/reports.service.js";
import { renderHTML } from "../utils/reports.template.js";
import { htmlToPdfBuffer } from "../utils/pdf.generator.js";
import { toExcelBuffer } from "../utils/excel.generator.js";

const router = express.Router();

// הרשאת בסיס (התאם ל-RBAC שלך)
function canViewReports(req) {
  return req?.user?.permissions?.can_view_reports === true || true; // TODO: החלף לאמיתי
}

router.use("/:entity", (req, res, next) => {
  const def = ENTITIES[req.params.entity];
  if (!def) return res.status(404).json({ error: "Unknown entity" });
  if (!canViewReports(req)) return res.status(403).json({ error: "FORBIDDEN" });
  next();
});

// Preview JSON (לשולחן בתצוגה)
router.get("/:entity/preview", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows }) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      res.json({ rows, total: rows.length });
    }
  );
});

// PDF
router.get("/:entity/export/pdf", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows, def }) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      const html = renderHTML({ def, rows, filters: req.query });
      htmlToPdfBuffer(html)
        .then((buf) => {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${req.params.entity}-report.pdf"`
          );
          res.end(buf);
        })
        .catch(() => res.status(500).json({ error: "PDF_ERROR" }));
    }
  );
});

// Excel
router.get("/:entity/export/excel", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows, def }) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
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
        .catch(() => res.status(500).json({ error: "XLSX_ERROR" }));
    }
  );
});

export default router;
