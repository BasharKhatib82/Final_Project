import React from "react";
import { useReport } from "./ReportContext";

export default function ReportFilters() {
  const { filtersDef, filters, setFilter, total } = useReport();
  return (
    <div
      className="flex flex-wrap items-center gap-2 bg-white/85 p-2 rounded border"
      dir="rtl"
    >
      {filtersDef.map((f) => (
        <Filter
          key={f.name}
          def={f}
          value={filters[f.name]}
          onChange={(v) => setFilter(f.name, v)}
        />
      ))}
      <div className="text-sm text-gray-500 mr-auto">
        סה״כ: {total.toLocaleString()}
      </div>
    </div>
  );
}

function Filter({ def, value, onChange }) {
  if (def.type === "select") {
    return (
      <select
        className="border rounded px-2 py-1 text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || "")}
      >
        <option value="">{def.label}</option>
        {(def.options || []).map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
  if (def.type === "date") {
    return (
      <div className="flex items-center gap-1 text-sm">
        <span>{def.label}:</span>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || "")}
        />
      </div>
    );
  }
  if (def.type === "daterange") {
    const [from, to] = Array.isArray(value) ? value : ["", ""];
    return (
      <div className="flex items-center gap-1 text-sm">
        <span>{def.label}:</span>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={from}
          onChange={(e) => onChange([e.target.value || "", to])}
        />
        <span>—</span>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={to}
          onChange={(e) => onChange([from, e.target.value || ""])}
        />
      </div>
    );
  }
  // text
  return (
    <input
      className="border rounded px-2 py-1 text-sm"
      placeholder={def.label}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
