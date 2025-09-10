/**
 * קומפוננטה: Leads
 * ----------------
 * 1. הצגת רשימת פניות עם אפשרות לסינון, שיוך נציגים, עדכון סטטוס, ביטול, חיפוש, ייצוא ושליחה במייל.
 * 2. שימוש ב-ReportView להצגת טבלה אינטראקטיבית עם עמודות, חיפושים ופילטרים.
 * 3. כולל הרשאות לפי useUser:
 *    - permission_add_lead → כפתור הוספה
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useUser, Popup } from "components/Tools";
import { NavigationButton } from "components/Buttons";
import { api, extractApiError } from "utils";
import ReportView from "../Reports/ReportView";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [popup, setPopup] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [repToSave, setRepToSave] = useState(null);
  const [newRepId, setNewRepId] = useState(null);
  const [statusToSave, setStatusToSave] = useState(null);
  const [newStatus, setNewStatus] = useState(null);

  const { user } = useUser();
  const navigate = useNavigate();

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

  const columns = [
    {
      key: "lead_id",
      label: "מס׳ פנייה",
      export: (r) => r.lead_id,
    },
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
      export: (r) => new Date(r.created_at).toLocaleString("he-IL"),
    },
    {
      key: "phone_number",
      label: "טלפון",
    },
    {
      key: "full_name",
      label: "שם לקוח",
    },
    {
      key: "project_name",
      label: "פרויקט",
    },
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
          <option value="חדש">חדש</option>
          <option value="בטיפול">בטיפול</option>
          <option value="טופל">טופל</option>
          <option value="בוטלה">בוטלה</option>
        </select>
      ),
      export: (r) => r.status,
    },
  ];

  // עמודת פעולות לפי הרשאות
  if (
    user?.permission_view_lead === 1 ||
    user?.permission_edit_lead === 1 ||
    user?.permission_delete_lead === 1
  ) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="flex justify-center">
          <div className="flex items-center gap-1 text-center">
            {user?.permission_view_lead === 1 && (
              <button
                onClick={() => navigate(`/dashboard/details_lead/${r.lead_id}`)}
                className="flex items-center gap-2 bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700 ml-1"
              >
                <Icon icon="emojione-v1:eye" width="1.2rem" height="1.2rem" />
                הצג
              </button>
            )}
            {user?.permission_edit_lead === 1 && (
              <button
                onClick={() => navigate(`/dashboard/edit_lead/${r.lead_id}`)}
                className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 ml-1"
              >
                <Icon
                  icon="fluent-color:edit-32"
                  width="1.2rem"
                  height="1.2rem"
                />
                עריכה
              </button>
            )}
            {user?.permission_delete_lead && r.active && (
              <button
                onClick={() => setLeadToDelete(r.lead_id)}
                className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                <Icon
                  icon="streamline-color:recycle-bin-2-flat"
                  width="1.2em"
                  height="1.2em"
                />
                מחיקה
              </button>
            )}
          </div>
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
        { value: "חדש", label: "חדש" },
        { value: "בטיפול", label: "בטיפול" },
        { value: "טופל", label: "טופל" },
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
  ];

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      <ReportView
        title="רשימת פניות"
        columns={columns}
        rows={leads.filter((l) => l.status !== "בוטלה")}
        filtersDef={filtersDef}
        searchableKeys={["phone_number", "full_name"]}
        pageSize={10}
        searchPlaceholder="חיפוש לפי שם או טלפון..."
        emailApiBase={api.defaults.baseURL}
        filtersVariant="inline"
        addButton={
          user?.permission_add_lead === 1 && (
            <NavigationButton
              label="הוספת פנייה חדשה"
              linkTo="/dashboard/add_lead"
            />
          )
        }
      />

      {popup?.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)}
        />
      )}

      {repToSave && (
        <Popup
          title="עדכון נציג"
          message="האם לעדכן את הנציג לפנייה זו?"
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
          title="עדכון סטטוס"
          message="האם לעדכן את הסטטוס?"
          mode="confirm"
          onConfirm={handleStatusSave}
          onClose={() => {
            setStatusToSave(null);
            setNewStatus(null);
          }}
        />
      )}

      {leadToDelete && (
        <Popup
          title="אישור ביטול פנייה"
          message="האם אתה בטוח שברצונך לבטל את הפנייה?"
          mode="confirm"
          onConfirm={handleDelete}
          onClose={() => setLeadToDelete(null)}
        />
      )}
    </div>
  );
}
