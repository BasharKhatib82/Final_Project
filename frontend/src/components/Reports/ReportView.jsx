// frontend/src/pages/Reports/ReportView.jsx

import React, { useRef } from "react";
import { ReportProvider } from "./ReportContext";
import ReportSearch from "./ReportSearch";
import ReportFilters from "./ReportFilters";
import ReportExport from "./ReportExport";
import ReportEmail from "./ReportEmail";
import ReportTable from "./ReportTable";
import ReportPagination from "./ReportPagination";

// כתובת ברירת מחדל למיילים / ייצוא
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
  filtersVariant = "inline", // "inline" או "block"
  extraTopContent = null, // אזור נוסף בין חיפוש לייצוא
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
      <div className="flex flex-col gap-2" dir="rtl">
        {/* כותרת דף ראשית ממורכזת */}
        <header className="flex items-center justify-center py-0 my-0">
          <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center">
            {title}
          </h2>
        </header>

        {/*כפתור הוספה (אם קיים) */}
        {addButton && (
          <div className="flex justify-start">
            <div className="inline-flex">{addButton}</div>
          </div>
        )}

        {/*אזור עליון: סינון, חיפוש, שיוך מרובה, ייצוא */}
        <section className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm">
          <div className="flex flex-col space-y-3">

            {/*שורה רישומי : חיפוש + פילטרים */}
            <div className="flex flex-wrap items-center gap-4">
              {filtersDef.length > 0 && (
                <ReportFilters variant={filtersVariant} showTotal={false} />
              )}
              <ReportSearch label="חיפוש" placeholder={searchPlaceholder} />
            </div>

            {/* (אם יש) extra content : שורה שנייה*/}
            {extraTopContent && (
              <div className="flex items-center gap-4">{extraTopContent}</div>
            )}

            {/* שורה שלישית : ייצוא ודוא"ל */}
            <div className="flex items-center gap-4">
              <ReportExport apiBase={emailApiBase} />
              {emailApiBase && <ReportEmail apiBase={emailApiBase} />}
            </div>
          </div>
        </section>

        {/* טבלת הדוח */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <ReportTable ref={printRef} />
        </section>

        {/* עמודים מעבר בין דפים*/}
        <ReportPagination />
      </div>
    </ReportProvider>
  );
}
