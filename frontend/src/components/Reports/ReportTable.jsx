// frontend\src\components\Reports\ReportTable.jsx

/**
 * קובץ: ReportTable.jsx
 * ---------------------
 * תיאור:
 * קומפוננטת טבלה להצגת נתוני דוחות.
 * (pageRows) מציגה כותרות עמודות ושורות בהתאם לעמוד הנוכחי .
 * במידה ואין נתונים – מוצגת הודעה מתאימה.
 *
 * תכונות עיקריות:
 * - columns ו־pageRows לקבלת useReport שימוש ב־   .
 * - מותאמת לעמודה render תמיכה בפונקציית  .
 * - הצגת הודעת "אין נתונים להצגה" כשאין תוצאות.
 * - על שורות hover מצב + Tailwind עיצוב בסיסי עם    .
 *
 * מטרה:
 * לאפשר הצגה נוחה, קריאה ורספונסיבית של נתוני הדוחות במבנה טבלאי.
 */

import React, { forwardRef } from "react";
import { useReport } from "./ReportContext";

const ReportTable = forwardRef(function ReportTable(_, ref) {
  const { columns, pageRows } = useReport();
  const headers = columns.map((c) => c.label);
  const colCount = headers.length;

  return (
    <div ref={ref}>
      <table
        className="w-full table-auto border-collapse text-sm text-center bg-white"
        dir="rtl"
      >
        <thead>
          <tr className="bg-slate-100 text-gray-800">
            {headers.map((h, i) => (
              <th key={i} className="p-2 border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="p-4 text-red-500">
                אין נתונים להצגה
              </td>
            </tr>
          ) : (
            pageRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50">
                {columns.map((c, i) => (
                  <td key={i} className="border p-2">
                    {typeof c.render === "function"
                      ? c.render(row)
                      : row[c.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});

export default ReportTable;
