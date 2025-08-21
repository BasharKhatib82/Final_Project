import React, { useRef } from "react";
import { ReportProvider } from "./ReportContext";
import ReportSearch from "./ReportSearch";
import ReportFilters from "./ReportFilters";
import ReportExport from "./ReportExport";
import ReportEmail from "./ReportEmail";
import ReportTable from "./ReportTable";
import ReportPagination from "./ReportPagination";

/**
 * שימוש:
 * <ReportView
 *   title="דו\"ח פעילות מערכת"
 *   columns={[{key:'log_id',label:'מזהה'}, ...]}
 *   rows={data}
 *   filtersDef={[{name:'time_date',type:'daterange',label:'תאריך'}, ...]}
 *   searchableKeys={['log_id','user_id','action_name']}
 *   pageSize={25}
 *   emailApiBase={process.env.REACT_APP_API_URL} // אופציונלי
 * />
 */
export default function ReportView({
  title,
  columns,
  rows,
  filtersDef = [],
  searchableKeys = [],
  pageSize = 20,
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
      <div className="flex flex-col gap-3" dir="rtl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold text-blue-700">{title}</h2>
          <div className="flex gap-2">
            <ReportSearch />
            <ReportExport printTargetRef={printRef} />
          </div>
        </div>

        <ReportFilters />

        <ReportTable ref={printRef} />
        <ReportPagination />

        {emailApiBase && <ReportEmail apiBase={emailApiBase} />}
      </div>
    </ReportProvider>
  );
}
