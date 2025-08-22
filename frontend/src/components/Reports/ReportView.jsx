import React, { useRef } from "react";
import { ReportProvider } from "./ReportContext";
import ReportSearch from "./ReportSearch";
import ReportFilters from "./ReportFilters";
import ReportExport from "./ReportExport";
import ReportEmail from "./ReportEmail";
import ReportTable from "./ReportTable";
import ReportPagination from "./ReportPagination";

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
          <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-4 text-center">
            {title}
          </h2>
        </header>

        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        {/* סרגל אחד פרוס */}
        <section className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
          <div className="flex items-center gap-4 ">
            {/* סטטוס עם אייקון */}
            <ReportFilters
              variant="inline"
              showTotal={false}
              labelPrefix="סטטוס :"
            />
            {/* חיפוש עם אייקון */}
            <ReportSearch label="חיפוש :" placeholder={searchPlaceholder} />
          </div>

          {/* יצוא + שליחה למייל עם אייקונים */}
          <div className="flex items-center gap-4">
            <ReportExport printTargetRef={printRef} />
            {emailApiBase && <ReportEmail apiBase={emailApiBase} />}
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
