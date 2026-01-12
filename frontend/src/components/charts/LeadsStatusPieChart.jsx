// src/components/charts/LeadsStatusPieChart.jsx

/**
 * רכיב גרפי להצגת סטטוס פניות
 * ------------------------------------------------
 * מציג תרשים דונאט של התפלגות הפניות לפי סטטוס
 * עבור החודש האחרון בלבד.
 *
 * קלט:
 * - data: מערך של אובייקטים [{ status, date }]
 *
 * פלט:
 * - תרשים דונאט המציג כמה פניות "חדשות", "בטיפול", "טופלה"
 *   מתוך החודש האחרון בלבד.
 */
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadsStatusPieChart = ({ data }) => {
  // אם data הוא אובייקט ולא מערך - זה הפורמט מהשרת
  const counts = {
    new: data?.new || 0,
    in_progress: data?.in_progress || 0,
    completed: data?.completed || 0,
  };

  const chartData = {
    labels: ["חדשה", "בטיפול", "טופלה"],
    datasets: [
      {
        data: [counts.new, counts.in_progress, counts.completed],
        backgroundColor: ["#ef4444", "#facc15", "#22c55e"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "Rubik",
            size: 12,
            weight: "500",
          },
          color: "#374151",
        },
      },
    },
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">
        (החודש) סטטוס הפניות
      </h3>
      <div className="flex-grow w-full">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsStatusPieChart;
