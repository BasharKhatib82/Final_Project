import React from "react";
import { useReport } from "./ReportContext";

export default function ReportSearch({
  label = "חיפוש :",
  placeholder = "שם תפקיד...",
}) {
  const { search, setSearch, setPage } = useReport();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">{label}</span>
      <input
        dir="rtl"
        className="border rounded px-3 py-1 text-sm"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>
  );
}
