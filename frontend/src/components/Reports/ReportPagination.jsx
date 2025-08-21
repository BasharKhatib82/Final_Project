import React from "react";
import { useReport } from "./ReportContext";

export default function ReportPagination() {
  const { page, setPage, pages } = useReport();
  if (pages <= 1) return null;
  const go = (p) => setPage(Math.min(Math.max(1, p), pages));
  return (
    <div className="flex items-center gap-2 justify-center mt-2" dir="rtl">
      <button className="px-2 py-1 border rounded" onClick={() => go(1)}>
        &laquo;
      </button>
      <button className="px-2 py-1 border rounded" onClick={() => go(page - 1)}>
        &lsaquo;
      </button>
      <span className="text-sm">
        עמוד {page} / {pages}
      </span>
      <button className="px-2 py-1 border rounded" onClick={() => go(page + 1)}>
        &rsaquo;
      </button>
      <button className="px-2 py-1 border rounded" onClick={() => go(pages)}>
        &raquo;
      </button>
    </div>
  );
}
