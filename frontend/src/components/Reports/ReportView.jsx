import React, { useRef } from "react";
import { ReportProvider } from "./ReportContext";
import ReportSearch from "./ReportSearch";
import ReportFilters from "./ReportFilters";
import ReportExport from "./ReportExport";
import ReportEmail from "./ReportEmail";
import ReportTable from "./ReportTable";
import ReportPagination from "./ReportPagination";

/**
 * props:
 * - title, columns, rows, filtersDef, searchableKeys, pageSize
 * - addButton?: ReactNode            // כפתור/ים להוספה בראש
 * - emailApiBase?: string            // אם מעבירים - מציג שליחה במייל בסוף
 */
export default function ReportView({
  title,
  columns,
  rows,
  filtersDef = [],
  searchableKeys = [],
  pageSize = 20,
  addButton,
  emailApiBase,
}) {
  const printRef = useRef(null);

  return (
    <ReportProvider
      title={title}
      columns={columns}
      rows={rows}
      filtersDef={filtersDef}
      searchableKeys={searchableKeys}
      pageSize={pageSize}
    >
      <div className="flex flex-col gap-4" dir="rtl">
        {/* כותרת הדף - בולטת ותמיד נראית */}
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-blue-700">{title}</h2>
          {/* אפשר לשים פה מידע משני בעתיד */}
        </header>

        {/* שורת פעולות עליונה: כפתור הוספה (שמאל) */}
        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        {/* סרגל סינון מקצועי: חיפוש + פילטרים יחד */}
        <section className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <ReportSearch />
            <div className="w-px h-6 bg-slate-200 mx-2" />
            <ReportFilters />
          </div>
        </section>

        {/* יצוא: Excel + PDF */}
        <section className="flex justify-start">
          <ReportExport printTargetRef={printRef} />
        </section>

        {/* טבלה */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <ReportTable ref={printRef} />
        </section>

        {/* עימוד */}
        <ReportPagination />

        {/* שליחה למייל - בסוף הדף */}
        {emailApiBase && (
          <section className="mt-1">
            <div className="rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm">
              <div className="text-sm text-slate-600 mb-2">שליחה במייל</div>
              <ReportEmail apiBase={emailApiBase} />
            </div>
          </section>
        )}
      </div>
    </ReportProvider>
  );
}
