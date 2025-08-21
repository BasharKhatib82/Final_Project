import React from "react";
import { useReport } from "./ReportContext";

export default function ReportSearch() {
  const { search, setSearch, setPage } = useReport();
  return (
    <input
      dir="rtl"
      className="border rounded px-3 py-1 text-sm"
      placeholder="🔍 חיפוש..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
    />
  );
}
