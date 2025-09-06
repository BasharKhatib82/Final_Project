import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../Buttons/NavigationButton";
import DeleteButton from "../Buttons/DeleteButton";
import Popup from "../Tools/Popup";
import { ReportProvider } from "../Reports/ReportContext";
import ReportExport from "../Reports/ReportExport";
import ReportEmail from "../Reports/ReportEmail";
import { useUser } from "../Tools/UserContext";

const api = process.env.REACT_APP_API_URL;

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkUserId, setBulkUserId] = useState("");
  const [popupData, setPopupData] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [repToSave, setRepToSave] = useState(null);
  const [newRepId, setNewRepId] = useState(null);
  const [statusToSave, setStatusToSave] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState(null);
  const [bulkAssignConfirm, setBulkAssignConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${api}/users/active`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${api}/projects`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error("שגיאה בטעינת פרויקטים:", err);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await axios.get(`${api}/leads`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const updatedLeads = res.data.data.map((lead) => ({
          ...lead,
          selectedRepId: lead.user_id || "",
          selectedStatus: lead.status,
        }));
        setLeads(updatedLeads);
      }
    } catch (err) {
      console.error("שגיאה בטעינת פניות:", err);
    }
  };

  const handleRepSelect = (leadId, newUserId) => {
    setRepToSave(leadId);
    setNewRepId(newUserId);
  };

  const handleRepSave = async (leadId, selectedRepId) => {
    try {
      const res = await axios.put(
        `${api}/leads/update-rep/${leadId}`,
        { user_id: selectedRepId },
        { withCredentials: true }
      );

      if (res.data.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.lead_id === leadId
              ? {
                  ...lead,
                  user_id: selectedRepId,
                  selectedRepId: selectedRepId,
                }
              : lead
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הנציג עודכן בהצלחה",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || res.data?.Message || "שגיאה בעדכון נציג",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון נציג",
        mode: "error",
      });
    } finally {
      setRepToSave(null);
      setNewRepId(null);
    }
  };

  const handleStatusSelect = (leadId, newStatus) => {
    setStatusToSave(leadId);
    setNewStatusValue(newStatus);
  };

  const handleStatusSave = async (leadId, selectedStatus) => {
    try {
      const res = await axios.put(
        `${api}/leads/update-status/${leadId}`,
        { status: selectedStatus },
        { withCredentials: true }
      );

      if (res.data.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.lead_id === leadId
              ? {
                  ...lead,
                  status: selectedStatus,
                  selectedStatus: selectedStatus,
                }
              : lead
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הסטטוס עודכן בהצלחה",
          mode: "success",
        });

        // סגור את popup אוטומטית אחרי 1.5 שניות
        setTimeout(() => setPopupData(null), 1500);
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || res.data?.Message || "שגיאה בעדכון סטטוס",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון סטטוס",
        mode: "error",
      });
    } finally {
      setStatusToSave(null);
      setNewStatusValue(null);
    }
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;

    try {
      const res = await axios.delete(`${api}/leads/delete/${leadToDelete}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setLeads((prevLeads) =>
          prevLeads.map((lead) =>
            lead.lead_id === leadToDelete
              ? { ...lead, status: "בוטלה", selectedStatus: "בוטלה" }
              : lead
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הפנייה בוטלה בהצלחה",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || res.data?.Message || "שגיאה בביטול פנייה",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בביטול פנייה",
        mode: "error",
      });
    } finally {
      setLeadToDelete(null);
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleBulkAssignConfirm = () => {
    if (selectedLeads.length === 0) {
      setPopupData({
        title: "שגיאה",
        message: "יש לבחור פניות",
        mode: "error",
      });
      return;
    }
    if (!bulkUserId) {
      setPopupData({
        title: "שגיאה",
        message: "יש לבחור נציג לשיוך",
        mode: "error",
      });
      return;
    }
    setBulkAssignConfirm(true);
  };

  const handleBulkAssign = async () => {
    try {
      const res = await axios.put(
        `${api}/leads/bulk-assign`,
        {
          leadIds: selectedLeads,
          user_id: bulkUserId === "null" ? null : bulkUserId,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        fetchLeads();
        setSelectedLeads([]);
        setBulkUserId("");
        setPopupData({
          title: "הצלחה",
          message: "השיוך בוצע בהצלחה",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || res.data?.Message || "שגיאה בשיוך פניות",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בשיוך פניות",
        mode: "error",
      });
    } finally {
      setBulkAssignConfirm(false);
    }
  };

  const handleClosePopup = () => {
    setPopupData(null);
  };

  const filteredLeads = leads.filter((lead) => {
    const name = `${lead.first_name} ${lead.last_name}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      search === "" ||
      lead.phone_number.includes(search) ||
      name.includes(search);
    const matchesStatus =
      statusFilter === "all"
        ? lead.status !== "בוטלה"
        : lead.status === statusFilter;
    const matchesProject =
      projectFilter === "all" || lead.project_name === projectFilter;
    const matchesRep =
      repFilter === "all" || String(lead.user_id) === repFilter;

    return matchesSearch && matchesStatus && matchesProject && matchesRep;
  });

  const columns = [
    { key: "lead_id", label: "מס׳ פנייה", export: (r) => r.lead_id },
    {
      key: "created_at",
      label: "תאריך יצירה",
      export: (r) =>
        new Date(r.created_at).toLocaleString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    { key: "phone_number", label: "טלפון", export: (r) => r.phone_number },
    {
      key: "full_name",
      label: "שם לקוח",
      export: (r) => `${r.first_name} ${r.last_name}`,
    },
    { key: "project_name", label: "פרויקט", export: (r) => r.project_name },
    {
      key: "rep",
      label: "נציג מטפל",
      export: (r) => {
        const u = users.find((u) => u.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "ללא";
      },
    },
    { key: "status", label: "סטטוס", export: (r) => r.status },
  ];

  const { user } = useUser();

  return (
    <>
      <div className="p-4 text-right">
        <header className="flex items-center justify-center py-0 my-0">
          <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-2 text-center">
            רשימת פניות
          </h2>
        </header>
        {user.lead_add_btn === 1 && (
          <div className="flex justify-start mb-2">
            <div className="inline-flex">
              <NavigationButton
                linkTo="/dashboard/add_lead"
                label="הוספת פנייה חדשה"
              />
            </div>
          </div>
        )}
        <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 ">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">כל הפניות</option>
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופל">טופל</option>
            <option value="בוטלה">בוטלה</option>
          </select>

          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">כל הפרויקטים</option>
            {projects.map((proj) => (
              <option key={proj.project_id} value={proj.project_name}>
                {proj.project_name}
              </option>
            ))}
          </select>

          <select
            value={repFilter}
            onChange={(e) => setRepFilter(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">כל הנציגים</option>
            <option value="null">ללא</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              type="text"
              placeholder="🔍 חיפוש לפי טלפון או שם לקוח..."
              className="border border-gray-300 rounded px-3 py-1 text-sm"
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
              <option value="null">ללא</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>

            <button
              onClick={handleBulkAssignConfirm}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            >
              שייך את הנבחרות ({selectedLeads.length})
            </button>
          </div>

          {/* 🔹 שורת ייצוא / הדפסה / שליחה למייל */}
          <ReportProvider
            title="רשימת פניות"
            columns={columns}
            rows={filteredLeads}
          >
            <div className="flex items-center flex-wrap gap-4 ">
              <ReportExport apiBase={api} />
              <ReportEmail apiBase={api} />
            </div>
          </ReportProvider>
        </div>
        <div className="overflow-auto rounded-lg shadow-lg bg-white/85 mt-4">
          <table className="w-full table-auto border-collapse text-sm text-center">
            <thead>
              <tr className="bg-slate-100 text-gray-800">
                <th className="p-2 border">✔️</th>
                <th className="p-2 border">מס׳ פנייה</th>
                <th className="p-2 border">תאריך יצירה</th>
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
                  <tr
                    key={lead.lead_id}
                    className="hover:bg-blue-50 transition"
                  >
                    <td className="border p-2">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.lead_id)}
                        onChange={() => handleSelectLead(lead.lead_id)}
                      />
                    </td>
                    <td className="border p-2">{lead.lead_id}</td>
                    <td className="border p-2">
                      {new Date(lead.created_at).toLocaleDateString("he-IL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}{" "}
                      -{" "}
                      {new Date(lead.created_at).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
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
                        <option value="בוטלה">בוטלה</option>
                      </select>
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
                      {lead.status !== "בוטלה" && (
                        <DeleteButton
                          onClick={() => setLeadToDelete(lead.lead_id)}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* פופאפ שינוי נציג */}
        {repToSave && (
          <Popup
            title="אישור שינוי נציג"
            message="האם אתה בטוח שברצונך לשנות את הנציג המטפל?"
            mode="confirm"
            onConfirm={() => handleRepSave(repToSave, newRepId)}
            onClose={() => {
              setRepToSave(null);
              setNewRepId(null);
            }}
          />
        )}

        {/* פופאפ שינוי סטטוס */}
        {statusToSave && (
          <Popup
            title="אישור שינוי סטטוס"
            message="האם אתה בטוח שברצונך לעדכן את סטטוס הפנייה?"
            mode="confirm"
            onConfirm={() => handleStatusSave(statusToSave, newStatusValue)}
            onClose={() => {
              setStatusToSave(null);
              setNewStatusValue(null);
            }}
          />
        )}

        {/* פופאפ מחיקה */}
        {leadToDelete && (
          <Popup
            title="אישור מחיקה"
            message="האם אתה בטוח שברצונך למחוק פנייה זו?"
            mode="confirm"
            onConfirm={handleDelete}
            onClose={() => setLeadToDelete(null)}
          />
        )}

        {/* פופאפ אישור Bulk */}
        {bulkAssignConfirm && (
          <Popup
            title="אישור שיוך מרובה"
            message={`האם אתה בטוח שברצונך לשייך ${selectedLeads.length} פניות?`}
            mode="confirm"
            onConfirm={handleBulkAssign}
            onClose={() => setBulkAssignConfirm(false)}
          />
        )}

        {/* פופאפ רגיל */}
        {popupData && (
          <Popup
            title={popupData.title}
            message={popupData.message}
            mode={popupData.mode}
            onClose={handleClosePopup}
          />
        )}
      </div>
    </>
  );
};

export default Leads;
