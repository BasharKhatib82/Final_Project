// src/components/Reports/ReportSearch.jsx
import React from "react";
import { useReport } from "./ReportContext";
import { Search } from "lucide-react";

export default function ReportSearch({
  label = "חיפוש :",
  placeholder = "חיפוש...",
  size = "sm", // אפשרות לשלוט בגודל (sm/md)
}) {
  const { search, setSearch, setPage } = useReport();

  const inputClass =
    size === "sm"
      ? "border rounded pl-2 pr-8 py-1 text-sm"
      : "border rounded pl-3 pr-10 py-2 text-base";

  return (
    <div className="flex items-center gap-2" dir="rtl">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="relative">
        <Search
          size={16}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          dir="rtl"
          type="text"
          aria-label="Search"
          className={inputClass}
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // איפוס עמוד ל־1 אחרי שינוי חיפוש
          }}
        />
      </div>
    </div>
  );
}
