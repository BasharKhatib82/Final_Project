// components/charts/LeadsBySourceChart.jsx
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

const LeadsBySourceChart = ({ data }) => {
  const labels = data.map((item) => item.source);
  const values = data.map((item) => item.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "לידים לפי מקור",
        data: values,
        backgroundColor: "#34d399",
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <h3 className="text-center font-semibold mb-4">פניות לפי מקור</h3>
      <Bar data={chartData} />
    </div>
  );
};

export default LeadsBySourceChart;
