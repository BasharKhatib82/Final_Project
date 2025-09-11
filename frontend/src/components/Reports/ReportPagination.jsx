// frontend\src\components\Reports\ReportPagination.jsx

/**
 * קובץ: ReportPagination.jsx
 * --------------------------
 * תיאור:
 * קומפוננטת פג'ינציה לדוחות.
 * מאפשרת מעבר בין עמודים, קפיצה לעמוד מסוים,
 * וכפתורים לראשון/אחרון/הבא/הקודם.
 *
 * תכונות עיקריות:
 * - page, setPage ו־pages לקבלת useReport שימוש ב.
 * - לשמירה על עמוד בטווח חוקי go()  מנגנון .
 * - Enter שדה קלט לקפיצה ישירה לעמוד בלחיצה על .
 * - מוסתר אם יש רק עמוד אחד.
 */

import React, { useState } from "react";
import { useReport } from "./ReportContext";

export default function ReportPagination() {
  const { page, setPage, pages } = useReport();
  const [inputPage, setInputPage] = useState(page);

  if (pages <= 1) return null;

  const go = (p) => {
    const safePage = Math.min(Math.max(1, p), pages);
    setPage(safePage);
    setInputPage(safePage); // עדכון השדה אחרי הקפיצה
  };

  const handleInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const handleInputKey = (e) => {
    if (e.key === "Enter") {
      const num = parseInt(inputPage, 10);
      if (!isNaN(num)) go(num);
    }
  };

  return (
    <div className="flex items-center gap-2 justify-center mt-2" dir="rtl">
      {/* עמוד ראשון */}
      <button
        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => go(1)}
        disabled={page === 1}
      >
        &laquo;
      </button>

      {/* עמוד קודם */}
      <button
        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => go(page - 1)}
        disabled={page === 1}
      >
        &lsaquo;
      </button>

      {/* שדה קפיצה לעמוד */}
      <span className="text-sm">עמוד</span>
      <input
        type="number"
        min="1"
        max={pages}
        value={inputPage}
        onChange={handleInputChange}
        onKeyDown={handleInputKey}
        className="w-14 border rounded px-2 py-1 text-center text-sm"
      />
      <span className="text-sm">/ {pages}</span>

      {/* עמוד הבא */}
      <button
        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => go(page + 1)}
        disabled={page === pages}
      >
        &rsaquo;
      </button>

      {/* עמוד אחרון */}
      <button
        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => go(pages)}
        disabled={page === pages}
      >
        &raquo;
      </button>
    </div>
  );
}
