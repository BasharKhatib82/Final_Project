import React from "react";
import { useReport } from "./ReportContext";
import { Search } from "lucide-react";

export default function ReportSearch({
  label = "חיפוש :",
  placeholder = "חיפוש...",
}) {
  const { search, setSearch, setPage } = useReport();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-700">{label}</span>
      <div className="relative">
        <Search
          size={16}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          dir="rtl"
          className="border rounded pl-2 pr-8 py-1 text-sm"
          placeholder={placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
