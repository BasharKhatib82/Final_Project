import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Button from "../Buttons/Button";
import Tooltip from "../Tools/Tooltip";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await axios.get("http://localhost:8801/leads", {
        withCredentials: true,
      });
      setLeads(res.data.Result);
    } catch (err) {
      console.error("שגיאה בטעינת פניות:", err);
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק פנייה זו?")) return;
    try {
      const res = await axios.delete(
        `http://localhost:8801/leads/delete/${leadId}`,
        {
          withCredentials: true,
        }
      );
      if (res.data.Status) {
        setLeads((prev) => prev.filter((l) => l.lead_id !== leadId));
      }
    } catch (err) {
      console.error("שגיאה במחיקת פנייה:", err);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const name = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      search === "" ||
      lead.phone_number.includes(search) ||
      name.includes(search);
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת פניות
      </h2>

      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-2">
        <Button linkTo="/dashboard/add_lead" label="הוספת פנייה חדשה" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-rubik border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
        >
          <option value="all">הכל</option>
          <option value="חדש">חדש</option>
          <option value="בטיפול">בטיפול</option>
          <option value="טופל">טופל</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 חיפוש לפי טלפון או שם לקוח..."
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 cursor-pointer"
            >
              ✖
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-lg shadow-lg bg-white/85">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              <th className="p-2 border">מס׳ פנייה</th>
              <th className="p-2 border">טלפון</th>
              <th className="p-2 border">שם לקוח</th>
              <th className="p-2 border">פרויקט</th>
              <th className="p-2 border">נציג מטפל</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-red-500 p-4">
                  אין פניות להצגה
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.lead_id} className="hover:bg-blue-50 transition">
                  <td className="border p-2">{lead.lead_id}</td>
                  <td className="border p-2">{lead.phone_number}</td>
                  <td className="border p-2">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="border p-2">{lead.project_name}</td>
                  <td className="border p-2">
                    {lead.rep_first_name
                      ? `${lead.rep_first_name} ${lead.rep_last_name}`
                      : "ללא"}
                  </td>
                  <td
                    className={`border p-2 font-semibold ${
                      lead.status === "חדש"
                        ? "text-green-600"
                        : lead.status === "בטיפול"
                        ? "text-blue-600"
                        : "text-gray-600"
                    }`}
                  >
                    {lead.status}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/leads/${lead.lead_id}`)
                      }
                      className="bg-blue-500 text-white mx-1 px-2 py-1 rounded hover:bg-blue-600"
                    >
                      הצג פנייה
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/dashboard/leads/edit/${lead.lead_id}`)
                      }
                      className="bg-yellow-500 text-white mx-1 px-2 py-1 rounded hover:bg-yellow-600"
                    >
                      עריכה
                    </button>

                    <button
                      onClick={() => handleDelete(lead.lead_id)}
                      className="bg-red-500 text-white mx-1 px-2 py-1 rounded hover:bg-red-600"
                    >
                      מחיקה
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leads;
