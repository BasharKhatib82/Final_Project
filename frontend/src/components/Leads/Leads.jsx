/**
 * קומפוננטה: Leads
 * ----------------
 * 1. הצגת רשימת פניות עם אפשרות לסינון, שיוך נציגים, עדכון סטטוס, ביטול, חיפוש, ייצוא ושליחה במייל.
 * 2. שימוש ב-ReportView להצגת טבלה אינטראקטיבית עם עמודות, חיפושים ופילטרים.
 * 3. כולל הרשאות לפי useUser:
 *    - permission_add_lead → כפתור הוספה
 *    - permission_edit_lead → עריכה
 *    - permission_delete_lead → מחיקה
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useUser, Popup } from "components/Tools";
import { AppButton } from "components/Buttons";
import { api, extractApiError } from "utils";
import ReportView from "../Reports/ReportView";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [popup, setPopup] = useState(null);

  const [repToSave, setRepToSave] = useState(null);
  const [newRepId, setNewRepId] = useState(null);
  const [statusToSave, setStatusToSave] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);

  const [selectedLeads, setSelectedLeads] = useState([]);
  const [bulkUserId, setBulkUserId] = useState("");
  const [bulkAssignConfirm, setBulkAssignConfirm] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === undefined) return; // עדיין טוען את המשתמש
    if (!user) return; // לא מחובר - לא עושים כלום
    if (user.leads_page_access !== 1) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await api.get("/leads");
      const rows = res.data.data || [];
      setLeads(
        rows.map((l) => ({
          ...l,
          full_name: `${l.first_name} ${l.last_name}`.trim(),
          selectedRepId: l.user_id || "",
          selectedStatus: l.status,
        }))
      );
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/", { replace: true });
        return;
      }

      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת פניות"),
        mode: "error",
        show: true,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/active");
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("שגיאה בטעינת עובדים", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data?.data || []);
    } catch (err) {
      console.error("שגיאה בטעינת פרויקטים", err);
    }
  };

  const handleRepSave = async () => {
    try {
      await api.put(`/leads/update-rep/${repToSave}`, { user_id: newRepId });
      fetchLeads();
      setPopup({
        title: "הצלחה",
        message: "הנציג עודכן בהצלחה",
        mode: "success",
        show: true,
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בעדכון נציג"),
        mode: "error",
        show: true,
      });
    } finally {
      setRepToSave(null);
      setNewRepId(null);
    }
  };

  const handleStatusSave = async () => {
    try {
      await api.put(`/leads/update-status/${statusToSave}`, {
        status: newStatus,
      });
      fetchLeads();
      setPopup({
        title: "הצלחה",
        message: "הסטטוס עודכן בהצלחה",
        mode: "success",
        show: true,
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בעדכון סטטוס"),
        mode: "error",
        show: true,
      });
    } finally {
      setStatusToSave(null);
      setNewStatus(null);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/leads/delete/${leadToDelete}`);
      fetchLeads();
      setPopup({
        title: "הצלחה",
        message: "הפנייה בוטלה בהצלחה",
        mode: "success",
        show: true,
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בביטול פנייה"),
        mode: "error",
        show: true,
      });
    } finally {
      setLeadToDelete(null);
    }
  };

  const handleBulkAssign = async () => {
    try {
      await api.put("/leads/bulk-assign", {
        leadIds: selectedLeads,
        user_id: bulkUserId === "null" ? null : bulkUserId,
      });
      fetchLeads();
      setSelectedLeads([]);
      setBulkUserId("");
      setPopup({
        title: "הצלחה",
        message: "השיוך בוצע בהצלחה",
        mode: "success",
        show: true,
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בשיוך מרובה"),
        mode: "error",
        show: true,
      });
    } finally {
      setBulkAssignConfirm(false);
    }
  };

  const bulkAssignBar = (
    <div className="flex flex-wrap items-center gap-4">
      <Icon
        icon="icon-park:four-round-point-connection"
        width="1.5em"
        height="1.5em"
      />
      <label className="text-sm">שיוך מרובה:</label>
      <select
        value={bulkUserId}
        onChange={(e) => setBulkUserId(e.target.value)}
        className="border border-gray-300 rounded px-3 py-1 text-sm"
      >
        <option value="">בחר נציג</option>
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
            setPopup({
              title: "שגיאה",
              message: "יש לבחור פניות ונציג לשיוך",
              mode: "error",
              show: true,
            });
            return;
          }
          setBulkAssignConfirm(true);
        }}
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
      >
        שיוך {selectedLeads.length} פניות
      </button>
    </div>
  );

  const columns = [
    {
      key: "select",
      label: "✔️",
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedLeads.includes(r.lead_id)}
          onChange={() => {
            setSelectedLeads((prev) =>
              prev.includes(r.lead_id)
                ? prev.filter((id) => id !== r.lead_id)
                : [...prev, r.lead_id]
            );
          }}
        />
      ),
      export: () => null,
    },
    { key: "lead_id", label: "מס׳ פנייה" },
    {
      key: "created_at",
      label: "תאריך יצירה",
      render: (r) =>
        new Date(r.created_at).toLocaleString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
    },
    { key: "phone_number", label: "טלפון" },
    { key: "full_name", label: "שם לקוח" },
    { key: "project_name", label: "פרויקט" },
    {
      key: "rep",
      label: "נציג",
      render: (r) => (
        <select
          value={r.selectedRepId}
          onChange={(e) => {
            setRepToSave(r.lead_id);
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
      ),
      export: (r) => {
        const u = users.find((u) => u.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "ללא";
      },
    },
    {
      key: "status",
      label: "סטטוס",
      render: (r) => (
        <select
          value={r.selectedStatus}
          onChange={(e) => {
            setStatusToSave(r.lead_id);
            setNewStatus(e.target.value);
          }}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          <option value="חדשה">חדשה</option>
          <option value="בטיפול">בטיפול</option>
          <option value="טופלה">טופלה</option>
          <option value="בוטלה">בוטלה</option>
        </select>
      ),
    },
  ];

  if (
    user?.permission_view_lead === 1 ||
    user?.permission_edit_lead === 1 ||
    user?.permission_delete_lead === 1
  ) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="flex justify-center gap-1">
          {user?.permission_view_lead === 1 && (
            <button
              onClick={() => navigate(`/dashboard/details_lead/${r.lead_id}`)}
              className="flex items-center gap-1 bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
            >
              <Icon icon="emojione-v1:eye" width="1.2rem" />
              הצג
            </button>
          )}
          {user?.permission_edit_lead === 1 && (
            <button
              onClick={() => navigate(`/dashboard/edit_lead/${r.lead_id}`)}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              <Icon icon="fluent-color:edit-32" width="1.2rem" />
              עריכה
            </button>
          )}
          {user?.permission_delete_lead === 1 && r.status !== "בוטלה" && (
            <button
              onClick={() => setLeadToDelete(r.lead_id)}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              <Icon icon="streamline-color:recycle-bin-2-flat" width="1.2em" />
              מחיקה
            </button>
          )}
        </div>
      ),
      export: () => null,
    });
  }

  const filtersDef = [
    {
      name: "status",
      label: "סטטוס",
      type: "select",
      options: [
        { value: "", label: "כל הסטטוסים" },
        { value: "חדשה", label: "חדשה" },
        { value: "בטיפול", label: "בטיפול" },
        { value: "טופלה", label: "טופלה" },
        { value: "בוטלה", label: "בוטלה" },
      ],
    },
    {
      name: "project_name",
      label: "פרויקט",
      type: "select",
      options: [
        { value: "", label: "כל הפרויקטים" },
        ...projects.map((p) => ({
          value: p.project_name,
          label: p.project_name,
        })),
      ],
    },
    {
      name: "user_id",
      label: "נציג",
      type: "select",
      options: [
        { value: "", label: "כל הנציגים" },
        { value: "null", label: "ללא" },
        ...users.map((u) => ({
          value: u.user_id,
          label: `${u.first_name} ${u.last_name}`,
        })),
      ],
    },
    {
      name: "created_at",
      label: "טווח תאריכים",
      type: "daterange",
    },
  ];
  const defaultFilters = { status: "חדשה" };
  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      <ReportView
        title="רשימת פניות"
        columns={columns}
        rows={leads}
        filtersDef={filtersDef}
        searchableKeys={["phone_number", "full_name"]}
        pageSize={10}
        searchPlaceholder="חיפוש לפי שם או טלפון..."
        emailApiBase={api.defaults.baseURL}
        filtersVariant="inline"
        addButton={
          user?.permission_add_lead === 1 && (
            <AppButton
              label="הוספת פנייה חדשה"
              icon={
                <Icon icon="basil:add-outline" width="1.2em" height="1.2em" />
              }
              variant="navigate"
              to="/dashboard/add_lead"
            />
          )
        }
        defaultFilters={defaultFilters}
        extraTopContent={bulkAssignBar}
      />

      {/* Popups */}
      {popup?.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)}
        />
      )}

      {/* הודעת עדכון נציג מטפל בפנייה */}
      {repToSave && (
        <Popup
          title="עדכון נציג"
          message="האם לעדכן נציג מטפל לפנייה זו ?"
          mode="confirm"
          onConfirm={handleRepSave}
          onClose={() => {
            setRepToSave(null);
            setNewRepId(null);
          }}
        />
      )}

      {/* הודעת עדכון סטטוס פנייה */}
      {statusToSave && (
        <Popup
          title="עדכון סטטוס"
          message={`האם לעדכן סטטוס פנייה מספר [ ${statusToSave} ] ?`}
          mode="confirm"
          onConfirm={handleStatusSave}
          onClose={() => {
            setStatusToSave(null);
            setNewStatus(null);
          }}
        />
      )}

      {/* הודעת מחיקת פנייה */}
      {leadToDelete && (
        <Popup
          title="אישור ביטול פנייה"
          message={`האם אתה בטוח שברצונך לבטל פנייה מספר [ ${leadToDelete} ] ?`}
          mode="confirm"
          onConfirm={handleDelete}
          onClose={() => setLeadToDelete(null)}
        />
      )}

      {/* הודעת שיוך פניות מרובה */}
      {bulkAssignConfirm && (
        <Popup
          title="אישור שיוך מרובה"
          message={`האם אתה בטוח שברצונך לשייך ${selectedLeads.length} פניות לנציג שנבחר ?`}
          mode="confirm"
          onConfirm={handleBulkAssign}
          onClose={() => setBulkAssignConfirm(false)}
        />
      )}
    </div>
  );
}
