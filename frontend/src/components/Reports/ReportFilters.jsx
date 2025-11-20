// frontend\src\components\Reports\ReportFilters.jsx

/**
 * קובץ: ReportFilters.jsx
 * -----------------------
 * תיאור:
 * קומפוננטה להצגת פילטרים לדוחות (טקסט, תאריך, טווח תאריכים, select).
 * ומציגה גם סה״כ שורות מסוננות inline או block תומכת במצב  .
 *
 * תכונות עיקריות:
 * - filtersDef, filters ו־setFilter לקבלת useReport שימוש ב .
 * - לבניית אפשרויות מהנתונים dynamic select תמיכה ב .
 * - תמיכה בסוגי פילטרים: select, date, daterange, text.
 * - במידת הצורך total הצגת סה״כ רשומות .
 *
 * מטרה:
 * לאפשר סינון גמיש ואינטראקטיבי על נתוני הדוח.
 */

import React, { useMemo } from "react";
import { useReport } from "./ReportContext";
import { Icon } from "@iconify/react";

export default function ReportFilters({ variant = "block", showTotal = true }) {
  const { filtersDef, filters, setFilter, total, filteredRows } = useReport();

  return (
    <div
      className={
        variant === "inline"
          ? "flex items-center gap-2"
          : "flex flex-wrap items-center gap-2 bg-white/85 p-2 rounded border"
      }
      dir="rtl"
    >
      {filtersDef.map((f) => (
        <Filter
          key={f.name}
          def={f}
          value={filters[f.name]}
          onChange={(v) => setFilter(f.name, v)}
          inline={variant === "inline"}
          filteredRows={filteredRows}
        />
      ))}

      {showTotal && (
        <div className="text-sm text-gray-500 mr-auto">
          סה״כ: {total.toLocaleString()}
        </div>
      )}
    </div>
  );
}

function Filter({ def, value, onChange, inline, filteredRows }) {
  const renderLabel = () =>
    inline && (
      <span className="text-sm text-slate-700 inline-flex items-center gap-1">
        <Icon
          icon="streamline-ultimate-color:filter-1"
          width="1.5em"
          height="1.5em"
        />
        {def.labelPrefix || def.label}
      </span>
    );

  const options = def.options || [];

  <select
    id={def.name}
    className="border rounded px-2 py-1 text-sm"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value || "")}
  >
    {options.map((opt) => (
      <option key={String(opt.value)} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>;

  // //  נבנה אפשרויות מהנתונים dynamic: true אם הפילטר מוגדר
  // const dynamicOptions = useMemo(() => {
  //   if (def.type === "select" && def.dynamic && Array.isArray(filteredRows)) {
  //     // יוצרים Map ייחודי לפי value
  //     const uniq = new Map();
  //     filteredRows.forEach((row) => {
  //       const value = String(row[def.name] ?? "");
  //       const label = row[def.optionLabelKey || def.name] || "לא ידוע"; // טיפול בחסר
  //       if (!uniq.has(value)) uniq.set(value, label);
  //     });

  //     return [
  //       { value: "", label: `כל ה${def.label}ים` },
  //       ...Array.from(uniq.entries()).map(([value, label]) => ({
  //         value,
  //         label,
  //       })),
  //     ];
  //   }
  //   return def.options || [];
  // }, [def, filteredRows]);

  // // Select
  // if (def.type === "select") {
  //   return (
  //     <div className="flex items-center gap-2">
  //       {renderLabel()}
  //       <select
  //         id={def.name}
  //         className="border rounded px-2 py-1 text-sm"
  //         value={value ?? ""}
  //         onChange={(e) => onChange(e.target.value || "")}
  //       >
  //         {(dynamicOptions || []).map((opt) => (
  //           <option key={String(opt.value)} value={opt.value}>
  //             {opt.label}
  //           </option>
  //         ))}
  //       </select>
  //     </div>
  //   );
  // }

  //  תאריך יחיד
  if (def.type === "date") {
    return (
      <div className="flex items-center gap-2">
        {renderLabel()}
        <input
          type="date"
          id={def.name}
          className="border rounded px-2 py-1 text-sm"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  // טווח תאריכים
  if (def.type === "daterange") {
    const [from = "", to = ""] = value || [];

    return (
      <div className="flex items-center gap-2">
        {renderLabel()}
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={from}
          onChange={(e) => onChange([e.target.value, to])}
        />
        <span>-</span>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={to}
          onChange={(e) => onChange([from, e.target.value])}
        />
      </div>
    );
  }

  // ברירת מחדל → טקסט רגיל
  return (
    <div className="flex items-center gap-2">
      {renderLabel()}
      <input
        id={def.name}
        className="border rounded px-2 py-1 text-sm"
        placeholder={def.label}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
