// components/GenericTable.jsx
import React, { useState } from "react";

const GenericTable = ({
  title,
  columns,
  data,
  searchTerm,
  setSearchTerm,
  filterOptions,
  selectedFilter,
  setSelectedFilter,
  onEdit,
  onDelete,
  onAdd,
  filterFunction,
  rowsPerPage = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);

  const filteredData = data.filter((row) => {
    const term = searchTerm.toLowerCase();
    const searchMatch = columns.some((col) => {
      const value = String(row[col.key]).toLowerCase();
      return value.includes(term);
    });

    const filterMatch = filterFunction
      ? filterFunction(row, selectedFilter)
      : true;

    return searchMatch && filterMatch;
  });

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="main mt2rem">
      {title && (
        <h2 className="text-center font-blue fontXL mp2rem">{title}</h2>
      )}

      <div className="filters-container">
        {onAdd && (
          <button className="btn-add-dash fontBtnDash" onClick={onAdd}>
            הוספה חדשה
          </button>
        )}

        {filterOptions && (
          <select
            className="status-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="🔍  חיפוש..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="נקה חיפוש"
            >
              ❌
            </button>
          )}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.className}
                onClick={() => handleSort(col.key)}
                style={{ cursor: "pointer" }}
              >
                {col.header}
                {sortConfig?.key === col.key &&
                  (sortConfig.direction === "asc" ? " 🔼" : " 🔽")}
              </th>
            ))}
            {(onEdit || onDelete) && <th>פעולות</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={
                    typeof row[col.key] === "boolean"
                      ? row[col.key]
                        ? "status-yes"
                        : "status-no"
                      : undefined
                  }
                >
                  {typeof row[col.key] === "boolean"
                    ? row[col.key]
                      ? "✓"
                      : "✗"
                    : row[col.key]}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td>
                  {onEdit && (
                    <button
                      className="btn-edit fontBtnDash"
                      onClick={() => onEdit(row)}
                    >
                      עריכה
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className="btn-delete fontBtnDash"
                      onClick={() => onDelete(row)}
                    >
                      מחיקה
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            ⏮️ ראשון
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ◀️ קודם
          </button>
          <span>
            עמוד {currentPage} מתוך {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            הבא ▶️
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            אחרון ⏭️
          </button>
        </div>
      )}
    </div>
  );
};

export default GenericTable;
