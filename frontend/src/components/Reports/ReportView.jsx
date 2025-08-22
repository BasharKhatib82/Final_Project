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
 * - addButton?: ReactNode
 * - defaultFilters?: object
 * - emailApiBase?: string
 * - searchPlaceholder?: string   // 👈 חדש – placeholder דינמי לחיפוש
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
  defaultFilters = {},
  searchPlaceholder = "חיפוש...",
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
      defaultFilters={defaultFilters}
    >
      <div className="flex flex-col gap-4" dir="rtl">
        {/* כותרת ממורכזת */}
        <header className="flex items-center justify-center">
          <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
            {title}
          </h2>
        </header>

        {/* כפתור הוספה בראש (אם יש) */}
        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        {/* סרגל פרוס לרוחב עם מפרידים: סטטוס | חיפוש | יצאו קבוץ | מייל לשליחה */}
        <section className="rounded-xl border border-slate-200 bg-white/95 p-0 shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center divide-x divide-slate-200 divide-x-reverse">
            {/* אזור 1: סטטוס */}
            <div className="flex-1 min-w-[220px] p-3">
              <ReportFilters
                variant="inline"
                showTotal={false}
                labelPrefix="סטטוס :"
              />
            </div>

            {/* אזור 2: חיפוש */}
            <div className="flex-1 min-w-[240px] p-3">
              <ReportSearch label="חיפוש :" placeholder={searchPlaceholder} />
            </div>

            {/* אזור 3: יצוא */}
            <div className="flex-1 min-w-[220px] p-3">
              <ReportExport printTargetRef={printRef} />
            </div>

            {/* אזור 4: שליחה במייל */}
            {emailApiBase && (
              <div className="flex-1 min-w-[280px] p-3">
                <ReportEmail apiBase={emailApiBase} />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <ReportTable ref={printRef} />
        </section>

        <ReportPagination />
      </div>
    </ReportProvider>
  );
}
