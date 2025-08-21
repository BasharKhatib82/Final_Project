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
 * - defaultFilters?: object  // לדוגמה: { status: "active" }
 * - emailApiBase?: string
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
      defaultFilters={defaultFilters} // 👈 חשוב
    >
      <div className="flex flex-col gap-4" dir="rtl">
        <header className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-blue-700">{title}</h2>
        </header>

        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        {/* סרגל אחד בשורה: סטטוס | חיפוש | יצוא | מייל לשליחה */}
        <section className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <ReportFilters
              variant="inline"
              showTotal={false}
              labelPrefix="סטטוס :"
            />
            <div className="w-px h-6 bg-slate-200" />
            <ReportSearch label="חיפוש :" placeholder="שם תפקיד..." />
            <div className="w-px h-6 bg-slate-200" />
            <ReportExport printTargetRef={printRef} />
            {emailApiBase && (
              <>
                <div className="w-px h-6 bg-slate-200" />
                <ReportEmail apiBase={emailApiBase} compact />
              </>
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
