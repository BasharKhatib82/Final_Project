// src/components/charts/LeadsByUserChart.jsx

/**
 * רכיב גרפי להצגת פניות שטופלו לפי עובד שיווק
 * ------------------------------------------------
 * מציג תרשים עמודות אופקי שבו כל עמודה מייצגת עובד שיווק
 * וגובהה מייצג את מספר הפניות שטופלו על ידו.
 *
 * קלט:
 * - data: מערך של אובייקטים [{ name, count, status, role }]
 *   לדוגמה: { name: "דנה", count: 5, status: "טופלה", role: "עובד שיווק" }
 *
 * פלט:
 * - תרשים עמודות אופקי
 */
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const LeadsByUserChart = ({ data }) => {
  // סינון רק לעובדים ובסטטוס טופלה
  const filtered = data.filter((item) => item.status === "טופלה");

  const chartData = {
    labels: filtered.map((item) => item.name),
    datasets: [
      {
        label: "פניות שטופלו",
        data: filtered.map((item) => item.count),
        backgroundColor: "#8b5cf6", // סגול
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y", // גרף אופקי
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
        פניות שטופלו לפי עובד שיווק
      </h3>
      <div className="flex-grow w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsByUserChart;
