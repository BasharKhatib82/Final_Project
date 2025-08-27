// components/charts/LeadsByUserChart.jsx
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
  const chartData = {
    labels: data.map((user) => user.name),
    datasets: [
      {
        label: "לידים לעובד",
        data: data.map((user) => user.count),
        backgroundColor: "#818cf8",
      },
    ],
  };

  const options = {
    indexAxis: "y", // הופך לעמודות אופקיות
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="text-center font-semibold mb-4">פניות לפי עובד</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default LeadsByUserChart;
