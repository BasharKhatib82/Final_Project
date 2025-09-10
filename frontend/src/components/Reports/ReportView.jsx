import React, { useRef } from "react";
import { ReportProvider } from "./ReportContext";
import ReportSearch from "./ReportSearch";
import ReportFilters from "./ReportFilters";
import ReportExport from "./ReportExport";
import ReportEmail from "./ReportEmail";
import ReportTable from "./ReportTable";
import ReportPagination from "./ReportPagination";

const ENV_API_BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

export default function ReportView({
  title,
  columns,
  rows,
  filtersDef = [],
  searchableKeys = [],
  pageSize = 10,
  addButton,
  emailApiBase = ENV_API_BASE,
  defaultFilters = {},
  searchPlaceholder = "חיפוש...",
  filtersVariant = "inline", // 🟢 חדש – אפשר לבחור "inline" או "block"
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
        <header className="flex items-center justify-center py-0 my-0">
          <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-2 text-center">
            {title}
          </h2>
        </header>

        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
          <div className="flex flex-col space-y-3">
            {/* 🔹 שורה ראשונה: פילטרים + חיפוש */}
            <div className="flex flex-wrap items-center gap-4">
              {filtersDef.length > 0 && (
                <ReportFilters variant={filtersVariant} showTotal={false} />
              )}
              <ReportSearch label="חיפוש" placeholder={searchPlaceholder} />
            </div>

            {/* 🔹 שורה שנייה: יצוא + שליחה למייל */}
            <div className="flex items-center gap-4">
              <ReportExport apiBase={emailApiBase} />
              {emailApiBase && <ReportEmail apiBase={emailApiBase} />}
            </div>
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
