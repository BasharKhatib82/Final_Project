// src/components/Reports/ReportSearch.jsx
import React from "react";
import { useReport } from "./ReportContext";
import { Icon } from "@iconify/react";

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
        <Icon icon="flat-color-icons:search" width="1.5em" height="1.5em" />
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
