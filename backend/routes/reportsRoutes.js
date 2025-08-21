import express from "express";
import { ENTITIES } from "../utils/reports.schema.js";
import { fetchRows } from "../utils/reports.service.js";
import { buildPdfBuffer } from "../utils/pdfmake.generator.js";
import { buildExcelBuffer } from "../utils/excel.generator.js";

const router = express.Router();

// TODO: חבר ל-RBAC אמיתי בהמשך
router.use("/:entity", (req, res, next) => {
  const def = ENTITIES[req.params.entity];
  if (!def) return res.status(404).json({ error: "Unknown entity" });
  next();
});

// Preview JSON
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

// Excel
router.get("/:entity/export/excel", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows, def }) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      buildExcelBuffer(def, rows)
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

// PDF (pdfmake)
router.get("/:entity/export/pdf", (req, res) => {
  fetchRows(
    req.app.get("db"),
    req.params.entity,
    req.query,
    (err, { rows, def }) => {
      if (err) return res.status(500).json({ error: "DB_ERROR" });
      buildPdfBuffer(def, rows, {
        filters: req.query,
        meta: { brand: "Respondify CRM" },
      })
        .then((buf) => {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${req.params.entity}-report.pdf"`
          );
          res.end(buf);
        })
        .catch((e) => {
          console.error("[Reports][PDF] PDFMAKE_ERROR:", e);
          res.status(500).json({ error: "PDF_ERROR" });
        });
    }
  );
});

export default router;
