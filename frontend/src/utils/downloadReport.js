// frontend/src/utils/downloadReport.js
import axios from "axios";

export default async function downloadReport(apiBase, payload) {
  const res = await axios.post(`${apiBase}/reports/download`, payload, {
    responseType: "blob",
    withCredentials: true,
  });

  // ברירת מחדל
  let filename = `report.${payload.format || "xlsx"}`;

  // מנסים לחלץ שם מהכותרת
  const disposition = res.headers["content-disposition"];
  if (disposition) {
    const match = disposition.match(/filename\*=UTF-8''(.+)/);
    if (match && match[1]) {
      filename = decodeURIComponent(match[1]);
    }
  }

  // יצירת Blob והורדה
  const blob = new Blob([res.data]);
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
