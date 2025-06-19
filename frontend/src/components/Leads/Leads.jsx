import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../Buttons/NavigationButton";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkUserId, setBulkUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8801/users/active", {
        withCredentials: true,
      });
      if (res.data.Status) {
        setUsers(res.data.Result);
      }
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await axios.get("http://localhost:8801/leads", {
        withCredentials: true,
      });
      if (res.data.Status) {
        const updatedLeads = res.data.Result.map((lead) => ({
          ...lead,
          selectedRepId: lead.user_id || "",
          isRepChanged: false,
          selectedStatus: lead.status,
          isStatusChanged: false,
        }));
        setLeads(updatedLeads);
      }
    } catch (err) {
      console.error("שגיאה בטעינת פניות:", err);
    }
  };

  const handleRepSelect = (leadId, newUserId) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.lead_id === leadId
          ? {
              ...lead,
              selectedRepId: newUserId,
              isRepChanged: newUserId !== (lead.user_id || ""),
            }
          : lead
      )
    );
  };

  const handleRepSave = async (leadId, selectedRepId) => {
    try {
      const res = await axios.put(
        `http://localhost:8801/leads/update-rep/${leadId}`,
        { user_id: selectedRepId },
        { withCredentials: true }
      );

      if (res.data.Status) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.lead_id === leadId
              ? {
                  ...lead,
                  user_id: selectedRepId,
                  isRepChanged: false,
                }
              : lead
          )
        );
        alert("הנציג עודכן בהצלחה");
      } else {
        console.error("שגיאה בעדכון נציג:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בעדכון נציג:", err);
    }
  };

  const handleStatusSelect = (leadId, newStatus) => {
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.lead_id === leadId
          ? {
              ...lead,
              selectedStatus: newStatus,
              isStatusChanged: newStatus !== lead.status,
            }
          : lead
      )
    );
  };

  const handleStatusSave = async (leadId, selectedStatus) => {
    try {
      const res = await axios.put(
        `http://localhost:8801/leads/update-status/${leadId}`,
        { status: selectedStatus },
        { withCredentials: true }
      );

      if (res.data.Status) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.lead_id === leadId
              ? {
                  ...lead,
                  status: selectedStatus,
                  isStatusChanged: false,
                }
              : lead
          )
        );
        alert("הסטטוס עודכן בהצלחה");
      } else {
        console.error("שגיאה בעדכון סטטוס:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס:", err);
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

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleBulkAssign = async () => {
    if (selectedLeads.length === 0) {
      alert("יש לבחור פניות");
      return;
    }

    const userIdToAssign = bulkUserId === "null" ? null : bulkUserId;

    try {
      const res = await axios.put(
        `http://localhost:8801/leads/bulk-assign`,
        {
          leadIds: selectedLeads,
          user_id: userIdToAssign,
        },
        { withCredentials: true }
      );

      if (res.data.Status) {
        fetchLeads();
        setSelectedLeads([]);
        setBulkUserId("");
        alert("השיוך בוצע בהצלחה");
      }
    } catch (err) {
      console.error("שגיאה בשיוך פניות:", err);
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

      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-4">
        <NavigationButton
          linkTo="/dashboard/add_lead"
          label="הוספת פנייה חדשה"
        />

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

        <div className="flex items-center gap-2 ml-auto">
          <select
            value={bulkUserId}
            onChange={(e) => setBulkUserId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">בחר נציג לשיוך</option>
            <option value="null">ללא</option> {/* ← הוספנו אפשרות ללא */}
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleBulkAssign}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            שייך את הנבחרות ({selectedLeads.length})
          </button>
        </div>
      </div>

      {/* כאן תמשיך את הטבלה בדיוק כמו שהבאתי לך קודם → אין שינוי במבנה */}

      <div className="overflow-auto rounded-lg shadow-lg bg-white/85">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              <th className="p-2 border">✔️</th>
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
                <td colSpan="8" className="text-center text-red-500 p-4">
                  אין פניות להצגה
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <tr key={lead.lead_id} className="hover:bg-blue-50 transition">
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.lead_id)}
                      onChange={() => handleSelectLead(lead.lead_id)}
                    />
                  </td>
                  <td className="border p-2">{lead.lead_id}</td>
                  <td className="border p-2">{lead.phone_number}</td>
                  <td className="border p-2">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="border p-2">{lead.project_name}</td>
                  <td className="border p-2">
                    <select
                      value={lead.selectedRepId}
                      onChange={(e) =>
                        handleRepSelect(lead.lead_id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">ללא</option>
                      {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                    </select>

                    {lead.isRepChanged && (
                      <button
                        onClick={() =>
                          handleRepSave(lead.lead_id, lead.selectedRepId)
                        }
                        className="ml-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                      >
                        שמור
                      </button>
                    )}
                  </td>
                  <td className="border p-2">
                    <select
                      value={lead.selectedStatus}
                      onChange={(e) =>
                        handleStatusSelect(lead.lead_id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="חדש">חדש</option>
                      <option value="בטיפול">בטיפול</option>
                      <option value="טופל">טופל</option>
                    </select>

                    {lead.isStatusChanged && (
                      <button
                        onClick={() =>
                          handleStatusSave(lead.lead_id, lead.selectedStatus)
                        }
                        className="ml-2 bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                      >
                        שמור
                      </button>
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/details_lead/${lead.lead_id}`)
                      }
                      className="bg-blue-500 text-white mx-1 px-2 py-1 rounded hover:bg-blue-600"
                    >
                      הצג פנייה
                    </button>

                    <button
                      onClick={() =>
                        navigate(`/dashboard/edit_lead/${lead.lead_id}`)
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
