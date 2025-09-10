// frontend/src/pages/Leads/Leads.jsx

/**
 * קומפוננטה: Leads
 * -----------------
 * מטרות:
 * 1. מציגה רשימת פניות קיימות במערכת (כולל פניות חדשות, בטיפול, וכו').
 * 2. מאפשרת:
 * - צפייה וסינון של פניות לפי סטטוס, פרויקט ונציג.
 * - חיפוש לפי שם לקוח או מספר טלפון.
 * - שיוך פנייה לנציג בודד או מרובה.
 * - שינוי סטטוס פנייה.
 * - עריכת פרטי פנייה.
 * - ביטול פנייה.
 * - הוספת פנייה חדשה.
 *
 * שימושים:
 * - ניגשת ל־API כדי לשלוף נתוני פניות, משתמשים ופרויקטים.
 * - מציגה טבלה (ReportView) עם אפשרויות סינון, חיפוש וייצוא.
 * - משתמשת ב־Popup להצגת הודעות, שגיאות ואישורים.
 */

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { Popup, useUser } from "components/Tools";
import { NavigationButton } from "components/Buttons";
import ReportView from "../Reports/ReportView";
import { api, extractApiError } from "utils";

export default function Leads() {
  const [allLeads, setAllLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({
    show: false,
    title: "",
    message: "",
    mode: "",
    lead_id: null,
    bulk_leads: null,
  });

  const navigate = useNavigate();
  const { user } = useUser();

  // שליפת נתונים מהשרת
  useEffect(() => {
    Promise.all([fetchLeads(), fetchUsers(), fetchProjects()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchLeads = () => {
    return api
      .get("/leads")
      .then((res) => {
        const leads = res?.data?.data || [];
        setAllLeads(leads);
      })
      .catch((err) => {
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת הפניות"),
          mode: "error",
        });
      });
  };

  const fetchUsers = () => {
    return api
      .get("/users/active")
      .then((res) => setUsers(res?.data?.data || []));
  };

  const fetchProjects = () => {
    return api
      .get("/projects")
      .then((res) => setProjects(res?.data?.data || []));
  };

  // מעבר למסך עריכת/צפייה בפנייה
  const handleView = (lead_id) =>
    navigate(`/dashboard/details_lead/${lead_id}`);
  const handleEdit = (lead_id) => navigate(`/dashboard/edit_lead/${lead_id}`);

  // עדכון סטטוס הפנייה
  const confirmChangeStatus = (lead_id, status) => {
    api
      .put(`/leads/update-status/${lead_id}`, { status })
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "הסטטוס עודכן בהצלחה",
          mode: "success",
        });
        fetchLeads();
      })
      .catch((err) =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "אירעה שגיאה בעדכון הסטטוס"),
          mode: "error",
        })
      );
  };

  // עדכון נציג מטפל
  const confirmChangeRep = (lead_id, user_id) => {
    api
      .put(`/leads/update-rep/${lead_id}`, { user_id })
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "הנציג עודכן בהצלחה",
          mode: "success",
        });
        fetchLeads();
      })
      .catch((err) =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "אירעה שגיאה בעדכון הנציג"),
          mode: "error",
        })
      );
  };

  // ביטול פנייה (מחיקה לוגית)
  const confirmDelete = (lead_id) => {
    api
      .delete(`/leads/delete/${lead_id}`)
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: "הפנייה בוטלה בהצלחה",
          mode: "success",
        });
        fetchLeads();
      })
      .catch((err) =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "אירעה שגיאה בביטול הפנייה"),
          mode: "error",
        })
      );
  };

  // שיוך מרובה (Bulk Assign)
  const confirmBulkAssign = (bulk_leads, bulk_user_id) => {
    api
      .put("/leads/bulk-assign", {
        leadIds: bulk_leads,
        user_id: bulk_user_id,
      })
      .then(() => {
        setPopup({
          show: true,
          title: "הצלחה",
          message: `${bulk_leads.length} פניות שויכו בהצלחה`,
          mode: "success",
        });
        fetchLeads();
      })
      .catch((err) =>
        setPopup({
          show: true,
          title: "שגיאה",
          message: extractApiError(err, "אירעה שגיאה בשיוך הפניות"),
          mode: "error",
        })
      );
  };

  // הגדרת עמודות הדוח (MEMO לביצועים)
  const columns = useMemo(() => {
    const baseColumns = [
      { key: "lead_id", label: "מזהה", export: (l) => String(l.lead_id) },
      {
        key: "created_at",
        label: "תאריך יצירה",
        export: (l) =>
          new Date(l.created_at).toLocaleString("he-IL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        type: "date",
      },
      {
        key: "full_name",
        label: "שם לקוח",
        export: (l) => `${l.first_name || ""} ${l.last_name || ""}`,
      },
      { key: "phone_number", label: "טלפון", export: (l) => l.phone_number },
      {
        key: "project_name",
        label: "פרויקט",
        export: (l) => l.project_name,
        filterable: true,
      },
      {
        key: "user_id",
        label: "נציג מטפל",
        export: (l) => {
          const rep = users.find((u) => u.user_id === l.user_id);
          return rep ? `${rep.first_name} ${rep.last_name}` : "ללא";
        },
        render: (lead) => (
          <select
            defaultValue={lead.user_id || ""}
            onChange={(e) =>
              setPopup({
                show: true,
                title: "אישור שינוי נציג",
                message: `האם אתה בטוח שברצונך לשנות את הנציג המטפל של פנייה מספר ${lead.lead_id}?`,
                mode: "confirm",
                onConfirm: () => confirmChangeRep(lead.lead_id, e.target.value),
              })
            }
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
      },
      {
        key: "status",
        label: "סטטוס",
        export: (l) => l.status,
        render: (lead) => (
          <select
            defaultValue={lead.status}
            onChange={(e) =>
              setPopup({
                show: true,
                title: "אישור שינוי סטטוס",
                message: `האם אתה בטוח שברצונך לעדכן את הסטטוס של פנייה מספר ${lead.lead_id}?`,
                mode: "confirm",
                onConfirm: () =>
                  confirmChangeStatus(lead.lead_id, e.target.value),
              })
            }
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופל">טופל</option>
            <option value="בוטלה">בוטלה</option>
          </select>
        ),
      },
    ];

    baseColumns.push({
      key: "actions",
      label: "פעולות",
      render: (l) => (
        <div className="flex justify-center items-center gap-1">
          {user?.permission_view_lead === 1 && (
            <button
              onClick={() => handleView(l.lead_id)}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              <Icon icon="emojione-v1:eye" width="1.2rem" height="1.2rem" />
              הצג
            </button>
          )}
          {user?.permission_edit_lead === 1 && (
            <button
              onClick={() => handleEdit(l.lead_id)}
              className="flex items-center gap-2 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
            >
              <Icon
                icon="fluent-color:edit-32"
                width="1.2rem"
                height="1.2rem"
              />
              עריכה
            </button>
          )}
          {user?.permission_delete_lead === 1 && l.status !== "בוטלה" && (
            <button
              onClick={() =>
                setPopup({
                  show: true,
                  title: "אישור ביטול פנייה",
                  message: `⚠️ האם אתה בטוח שברצונך לבטל פנייה מספר ${l.lead_id}?`,
                  mode: "confirm",
                  onConfirm: () => confirmDelete(l.lead_id),
                })
              }
              className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              <Icon
                icon="streamline-color:recycle-bin-2-flat"
                width="1.2em"
                height="1.2em"
              />
              ביטול
            </button>
          )}
        </div>
      ),
    });

    return baseColumns;
  }, [users, user]);

  // הגדרת פילטרים
  const filtersDef = useMemo(() => {
    const projectOptions = projects.map((proj) => ({
      value: proj.project_name,
      label: proj.project_name,
    }));
    const repOptions = users.map((u) => ({
      value: u.user_id,
      label: `${u.first_name} ${u.last_name}`,
    }));

    return [
      {
        name: "status",
        label: "סטטוס",
        type: "select",
        options: [
          { value: "all", label: "כל הפניות" },
          { value: "חדש", label: "חדש" },
          { value: "בטיפול", label: "בטיפול" },
          { value: "טופל", label: "טופל" },
        ],
      },
      {
        name: "project_name",
        label: "פרויקט",
        type: "select",
        options: [{ value: "all", label: "כל הפרויקטים" }, ...projectOptions],
      },
      {
        name: "user_id",
        label: "נציג מטפל",
        type: "select",
        options: [
          { value: "all", label: "כל הנציגים" },
          { value: "null", label: "ללא" },
          ...repOptions,
        ],
      },
    ];
  }, [users, projects]);

  const defaultFilters = { status: "all", project_name: "all", user_id: "all" };

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      {loading ? (
        <div className="text-center text-gray-600">טוען נתונים...</div>
      ) : (
        <ReportView
          title="רשימת פניות"
          columns={columns}
          rows={allLeads}
          filtersDef={filtersDef}
          searchableKeys={["full_name", "phone_number"]}
          pageSize={25}
          emailApiBase={process.env.REACT_APP_API_URL}
          addButton={
            user?.permission_add_lead === 1 && (
              <NavigationButton
                linkTo="/dashboard/add_lead"
                label="הוספת פנייה חדשה"
              />
            )
          }
          defaultFilters={defaultFilters}
          searchPlaceholder="שם לקוח או טלפון..."
          showBulkAssign={user?.permission_assign_lead === 1}
          bulkAssignOptions={{
            title: "שיוך מרובה",
            label: "שייך נבחרות",
            selectPlaceholder: "בחר נציג לשיוך",
            options: [
              { value: "", label: "בחר נציג לשיוך" },
              { value: "null", label: "ללא" },
              ...users.map((u) => ({
                value: String(u.user_id),
                label: `${u.first_name} ${u.last_name}`,
              })),
            ],
            onBulkAssign: (leadIds, userId) =>
              setPopup({
                show: true,
                title: "אישור שיוך מרובה",
                message: `האם אתה בטוח שברצונך לשייך ${leadIds.length} פניות?`,
                mode: "confirm",
                onConfirm: () => confirmBulkAssign(leadIds, userId),
              }),
          }}
        />
      )}

      {popup.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() =>
            setPopup({ show: false, title: "", message: "", mode: "" })
          }
          onConfirm={popup.mode === "confirm" ? popup.onConfirm : undefined}
        />
      )}
    </div>
  );
}
