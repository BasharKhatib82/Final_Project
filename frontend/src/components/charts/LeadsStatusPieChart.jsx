// src/components/charts/LeadsStatusPieChart.jsx
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const LeadsStatusPieChart = ({ data }) => {
  const chartData = {
    labels: ["חדש", "בטיפול", "טופל"],
    datasets: [
      {
        data: [data.new, data.in_progress, data.completed],
        backgroundColor: ["#ef4444", "#facc15", "#22c55e"],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "65%", // להפוך לעוגה מודרנית (כמו דונאט)
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "Rubik",
            size: 12,
            weight: "500",
          },
          color: "#374151", // gray-700
        },
      },
    },
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4text-center">
        סטטוס הפניות
      </h3>
      <div className="w-[200px] h-[200px]">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default LeadsStatusPieChart;
