// frontend/src/pages/Leads/Leads.jsx

/**
 * קומפוננטה: Leads
 * ----------------
 * 1. כולל סטטוס, פרויקט ונציג (leads) מציגה רשימת פניות מלקוחות.
 * 2. אפשרויות:
 *    - שיוך נציג לפנייה.
 *    - עדכון סטטוס של פנייה.
 *    - מחיקת פנייה (מחיקה לוגית).
 *    - שיוך מרובה של נציגים לפניות נבחרות.
 *    - חיפוש, סינון, ייצוא והדפסה של טבלת הפניות.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationButton, DeleteButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { ReportProvider } from "../Reports/ReportContext";
import ReportExport from "../Reports/ReportExport";
import ReportEmail from "../Reports/ReportEmail";
import { api, extractApiError } from "utils";

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
  const { user } = useUser();

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchUsers = () => {
    api
      .get("/users/active")
      .then((res) => setUsers(res.data.data || []))
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת עובדים"),
          mode: "error",
        })
      );
  };

  const fetchProjects = () => {
    api
      .get("/projects")
      .then((res) => setProjects(res.data.data || []))
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת פרויקטים"),
          mode: "error",
        })
      );
  };

  const fetchLeads = () => {
    api
      .get("/leads")
      .then((res) => {
        const updatedLeads = res.data.data.map((lead) => ({
          ...lead,
          selectedRepId: lead.user_id || "",
          selectedStatus: lead.status,
        }));
        setLeads(updatedLeads);
      })
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת פניות"),
          mode: "error",
        })
      );
  };

  const handleRepSave = () => {
    api
      .put(`/leads/update-rep/${repToSave}`, { user_id: newRepId })
      .then(() => {
        setLeads((prev) =>
          prev.map((l) =>
            l.lead_id === repToSave
              ? { ...l, user_id: newRepId, selectedRepId: newRepId }
              : l
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הנציג עודכן בהצלחה",
          mode: "success",
        });
      })
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בעדכון נציג"),
          mode: "error",
        })
      )
      .finally(() => {
        setRepToSave(null);
        setNewRepId(null);
      });
  };

  const handleStatusSave = () => {
    api
      .put(`/leads/update-status/${statusToSave}`, { status: newStatusValue })
      .then(() => {
        setLeads((prev) =>
          prev.map((l) =>
            l.lead_id === statusToSave
              ? { ...l, status: newStatusValue, selectedStatus: newStatusValue }
              : l
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הסטטוס עודכן בהצלחה",
          mode: "success",
        });
        setTimeout(() => setPopupData(null), 1500);
      })
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בעדכון סטטוס"),
          mode: "error",
        })
      )
      .finally(() => {
        setStatusToSave(null);
        setNewStatusValue(null);
      });
  };

  const handleDelete = () => {
    api
      .delete(`/leads/delete/${leadToDelete}`)
      .then(() => {
        setLeads((prev) =>
          prev.map((l) =>
            l.lead_id === leadToDelete
              ? { ...l, status: "בוטלה", selectedStatus: "בוטלה" }
              : l
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הפנייה בוטלה בהצלחה",
          mode: "success",
        });
      })
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בביטול פנייה"),
          mode: "error",
        })
      )
      .finally(() => setLeadToDelete(null));
  };

  const handleBulkAssign = () => {
    api
      .put("/leads/bulk-assign", {
        leadIds: selectedLeads,
        user_id: bulkUserId === "null" ? null : bulkUserId,
      })
      .then(() => {
        fetchLeads();
        setSelectedLeads([]);
        setBulkUserId("");
        setPopupData({
          title: "הצלחה",
          message: "השיוך בוצע בהצלחה",
          mode: "success",
        });
      })
      .catch((err) =>
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בשיוך פניות"),
          mode: "error",
        })
      )
      .finally(() => setBulkAssignConfirm(false));
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
      label: "נציג",
      export: (r) => {
        const u = users.find((u) => u.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "ללא";
      },
    },
    { key: "status", label: "סטטוס", export: (r) => r.status },
  ];

  return (
    <div className="p-4 text-right">
      <header className="flex items-center justify-center py-0 my-0">
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-2 text-center">
          רשימת פניות
        </h2>
      </header>

      {user?.permission_add_lead === 1 && (
        <div className="flex justify-start mb-2">
          <NavigationButton
            linkTo="/dashboard/add_lead"
            label="הוספת פנייה חדשה"
          />
        </div>
      )}

      {/* Filters + Export */}
      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4">
        {/* פילטרים */}
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
          {users.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.first_name} {u.last_name}
            </option>
          ))}
        </select>

        {/* חיפוש */}
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

        {/* שיוך מרובה */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={bulkUserId}
            onChange={(e) => setBulkUserId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="">בחר נציג לשיוך</option>
            <option value="null">ללא</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (!selectedLeads.length || !bulkUserId) {
                setPopupData({
                  title: "שגיאה",
                  message: "יש לבחור פניות ונציג לשיוך",
                  mode: "error",
                });
                return;
              }
              setBulkAssignConfirm(true);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            שייך את הנבחרות ({selectedLeads.length})
          </button>
        </div>

        {/* ייצוא ודוחות */}
        <ReportProvider
          title="רשימת פניות"
          columns={columns}
          rows={filteredLeads}
          pageSize={10}
        >
          <div className="flex items-center flex-wrap gap-4">
            <ReportExport apiBase={process.env.REACT_APP_API_URL} />
            <ReportEmail apiBase={process.env.REACT_APP_API_URL} />
          </div>
        </ReportProvider>
      </div>

      {/* טבלה */}
      <div className="overflow-auto rounded-lg shadow-lg bg-white/85 mt-4">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              <th className="p-2 border">✔️</th>
              <th className="p-2 border">מס׳</th>
              <th className="p-2 border">תאריך</th>
              <th className="p-2 border">טלפון</th>
              <th className="p-2 border">שם לקוח</th>
              <th className="p-2 border">פרויקט</th>
              <th className="p-2 border">נציג</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center text-red-500 p-4">
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
                      onChange={() =>
                        setSelectedLeads((prev) =>
                          prev.includes(lead.lead_id)
                            ? prev.filter((id) => id !== lead.lead_id)
                            : [...prev, lead.lead_id]
                        )
                      }
                    />
                  </td>
                  <td className="border p-2">{lead.lead_id}</td>
                  <td className="border p-2">
                    {new Date(lead.created_at).toLocaleString("he-IL", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
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
                      onChange={(e) => {
                        setRepToSave(lead.lead_id);
                        setNewRepId(e.target.value);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="">ללא</option>
                      {users.map((u) => (
                        <option key={u.user_id} value={u.user_id}>
                          {u.first_name} {u.last_name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="border p-2">
                    <select
                      value={lead.selectedStatus}
                      onChange={(e) => {
                        setStatusToSave(lead.lead_id);
                        setNewStatusValue(e.target.value);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="חדש">חדש</option>
                      <option value="בטיפול">בטיפול</option>
                      <option value="טופל">טופל</option>
                      <option value="בוטלה">בוטלה</option>
                    </select>
                  </td>

                  <td className="border p-2">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/details_lead/${lead.lead_id}`)
                      }
                      className="bg-blue-500 text-white mx-1 px-2 py-1 rounded hover:bg-blue-600"
                    >
                      הצג
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

      {/* Popups */}
      {repToSave && (
        <Popup
          title="שינוי נציג"
          message="האם אתה בטוח שברצונך לעדכן את הנציג?"
          mode="confirm"
          onConfirm={handleRepSave}
          onClose={() => {
            setRepToSave(null);
            setNewRepId(null);
          }}
        />
      )}

      {statusToSave && (
        <Popup
          title="שינוי סטטוס"
          message="האם לעדכן את הסטטוס?"
          mode="confirm"
          onConfirm={handleStatusSave}
          onClose={() => {
            setStatusToSave(null);
            setNewStatusValue(null);
          }}
        />
      )}

      {leadToDelete && (
        <Popup
          title="אישור ביטול"
          message="האם אתה בטוח שברצונך לבטל פנייה זו?"
          mode="confirm"
          onConfirm={handleDelete}
          onClose={() => setLeadToDelete(null)}
        />
      )}

      {bulkAssignConfirm && (
        <Popup
          title="אישור שיוך מרובה"
          message={`האם לשייך ${selectedLeads.length} פניות?`}
          mode="confirm"
          onConfirm={handleBulkAssign}
          onClose={() => setBulkAssignConfirm(false)}
        />
      )}

      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
};

export default Leads;
