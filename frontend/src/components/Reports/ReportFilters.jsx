// src/components/Reports/ReportFilters.jsx
import React from "react";
import { useReport } from "./ReportContext";
import { Filter as FilterIcon } from "lucide-react";

export default function ReportFilters({ variant = "block", showTotal = true }) {
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

function Filter({ def, value, onChange, inline }) {
  const renderLabel = () =>
    inline && (
      <span className="text-sm text-slate-700 inline-flex items-center gap-1">
        <FilterIcon size={16} className="text-slate-500" />
        {def.labelPrefix || def.label}
      </span>
    );

  // 🔹 Select
  if (def.type === "select") {
    return (
      <div className="flex items-center gap-2">
        {renderLabel()}
        <select
          id={def.name}
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

  // 🔹 תאריך יחיד
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

  // 🔹 טווח תאריכים (from + to) – נשמר כ־מערך [from, to]
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

  // 🔹 ברירת מחדל → טקסט רגיל
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
