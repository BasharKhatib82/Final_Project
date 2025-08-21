import React from "react";
import { useReport } from "./ReportContext";

export default function ReportFilters({
  variant = "block",
  showTotal = true,
  labelPrefix = "סטטוס :",
}) {
  const { filtersDef, filters, setFilter, total } = useReport();

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
          labelPrefix={labelPrefix}
          inline={variant === "inline"}
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

function Filter({ def, value, onChange, inline, labelPrefix }) {
  if (def.type === "select") {
    return (
      <div className="flex items-center gap-2">
        {inline && (
          <span className="text-sm text-slate-700">{labelPrefix}</span>
        )}
        <select
          className="border rounded px-2 py-1 text-sm"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || "")}
        >
          {(def.options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  // לשאר הסוגים ב־inline לא נשתמש כאן; נשאיר ברירת מחדל:
  return (
    <input
      className="border rounded px-2 py-1 text-sm"
      placeholder={def.label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
