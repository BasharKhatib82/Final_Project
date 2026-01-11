// frontend\src\components\Tasks\Tasks.jsx

/**
 * קומפוננטה: Tasks
 * -----------------------
 * 1. מציגה את רשימת המשימות.
 * 2. מאפשרת סינון לפי סטטוס, נציג, חיפוש.
 * 3. אפשרות לשיוך מרובה של נציגים למשימות.
 * 4. עדכון סטטוס/נציג ישירות מהטבלה.
 * 5. פעולות: עריכה, הצגה, ביטול.
 * 6. ReportView כולל ייצוא ודוא"ל דרך .
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { AppButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import ReportView from "../Reports/ReportView";
import { api, extractApiError } from "utils";
import { fetchFullNameByUserId } from "../../utils/fullNameUser";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);

  const [popup, setPopup] = useState(null);

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [repToSave, setRepToSave] = useState(null);
  const [newRepId, setNewRepId] = useState(null);
  const [statusToSave, setStatusToSave] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [fullName, setFullName] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkUserId, setBulkUserId] = useState("");
  const [bulkAssignConfirm, setBulkAssignConfirm] = useState(false);

  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (user === undefined) return; // עדיין טוען את המשתמש
    if (!user) return; // לא מחובר - לא עושים כלום
    if (user.tasks_page_access !== 1) {
      navigate("/unauthorized", { replace: true });
    }
  }, [user, navigate]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      const rows = res.data.data || [];
      setTasks(
        rows.map((t) => ({
          ...t,
          selectedRepId: t.user_id || "",
          selectedStatus: t.status,
        }))
      );
    } catch (err) {
      console.error("שגיאה בטעינת משימות:", err);

      if (err.response?.status === 401) {
    navigate("/", { replace: true });
    return;
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

  const handleRepSave = async () => {
    try {
      await api.put(`/tasks/update-rep/${repToSave}`, { user_id: newRepId });
      fetchTasks();
      setPopup({
        title: "הצלחה",
        message: `הנציג/ה " ${fullName} " עודכן בהצלחה`,
        mode: "success",
      });
      setFullName("");
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בעדכון נציג"),
        mode: "error",
      });
    } finally {
      setRepToSave(null);
      setNewRepId(null);
    }
  };

  const handleStatusSave = async () => {
    try {
      await api.put(`/tasks/update-status/${statusToSave}`, {
        status: newStatus,
      });
      fetchTasks();
      setPopup({
        title: "הצלחה",
        message: `סטטוס משימה  " ${newStatus} " עודכן בהצלחה`,
        mode: "success",
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בעדכון סטטוס"),
        mode: "error",
      });
    } finally {
      setStatusToSave(null);
      setNewStatus(null);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tasks/delete/${taskToDelete}`);
      fetchTasks();
      setPopup({
        title: "הצלחה",
        message: `משימה מספר [ ${taskToDelete} ] בוטלה בהצלחה !`,
        mode: "success",
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בביטול משימה"),
        mode: "error",
      });
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleBulkAssign = async () => {
    try {
      await api.put("/tasks/bulk-assign", {
        taskIds: selectedTasks,
        user_id: bulkUserId === "null" ? null : bulkUserId,
      });
      fetchTasks();
      setSelectedTasks([]);
      setBulkUserId("");
      setPopup({
        title: "הצלחה",
        message: "שיוך המשימות בוצע בהצלחה",
        mode: "success",
      });
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בשיוך מרובה"),
        mode: "error",
      });
    } finally {
      setBulkAssignConfirm(false);
    }
  };

  const columns = [
    {
      key: "select",
      label: "✔️",
      render: (r) => (
        <input
          type="checkbox"
          checked={selectedTasks.includes(r.task_id)}
          onChange={() => {
            setSelectedTasks((prev) =>
              prev.includes(r.task_id)
                ? prev.filter((id) => id !== r.task_id)
                : [...prev, r.task_id]
            );
          }}
        />
      ),
      export: () => null,
    },
    { key: "task_id", label: "מזהה", export: (r) => r.task_id },
    { key: "task_title", label: "נושא", export: (r) => r.task_title },
    {
      key: "created_at",
      label: "תאריך יצירה",
      render: (r) =>
        new Date(r.created_at).toLocaleDateString("he-IL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      export: (r) => new Date(r.created_at).toLocaleDateString("he-IL"),
    },
    {
      key: "due_date",
      label: "תאריך יעד",
      render: (r) => {
        const isOverdue =
          new Date(r.due_date) < new Date() && r.status !== "טופלה";
        return (
          <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
            {new Date(r.due_date).toLocaleDateString("he-IL")}
          </span>
        );
      },
      export: (r) => new Date(r.due_date).toLocaleDateString("he-IL"),
    },
    {
      key: "status",
      label: "סטטוס",
      render: (r) => (
        <select
          value={r.selectedStatus}
          onChange={(e) => {
            setStatusToSave(r.task_id);
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
      export: (r) => r.status,
    },
    {
      key: "user_id",
      label: "נציג/ה",
      render: (r) => (
        <select
          value={r.selectedRepId}
          onChange={async (e) => {
            const selectedId = e.target.value;
            const fullName = await fetchFullNameByUserId(selectedId);
            setFullName(fullName);
            setRepToSave(r.task_id);
            setNewRepId(selectedId);
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
  ];
  if (
    user?.permission_view_task === 1 ||
    user?.permission_edit_task === 1 ||
    user?.permission_delete_task === 1
  ) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="flex justify-center gap-1">
          {user?.permission_view_task === 1 && (
            <button
              onClick={() => navigate(`/dashboard/details_task/${r.task_id}`)}
              className="flex items-center gap-1 bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
            >
              <Icon icon="emojione-v1:eye" width="1.2rem" />
              הצג
            </button>
          )}
          {user?.permission_edit_task === 1 && (
            <button
              onClick={() => navigate(`/dashboard/edit_task/${r.task_id}`)}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              <Icon icon="fluent-color:edit-32" width="1.2rem" />
              עריכה
            </button>
          )}
          {user?.permission_delete_task === 1 && r.status !== "בוטלה" && (
            <button
              onClick={() => setTaskToDelete(r.task_id)}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              <Icon icon="streamline-color:recycle-bin-2-flat" width="1.2rem" />
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

  const bulkAssignBar = (
    <div className="flex items-center gap-2">
      <label className="text-sm font-semibold">שיוך מרובה:</label>
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
          if (!selectedTasks.length || !bulkUserId) {
            setPopup({
              title: "שגיאה",
              message: "יש לבחור משימות ונציג",
              mode: "error",
            });
            return;
          }
          setBulkAssignConfirm(true);
        }}
        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 text-sm"
      >
        שיוך {selectedTasks.length} משימות
      </button>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      <ReportView
        title="רשימת משימות"
        columns={columns}
        rows={tasks}
        filtersDef={filtersDef}
        searchableKeys={["task_title", "description"]}
        searchPlaceholder="חיפוש לפי נושא"
        addButton={
          user?.permission_add_task === 1 && (
            <AppButton
              label="הוספת משימה חדשה"
              icon={
                <Icon icon="basil:add-outline" width="1.2em" height="1.2em" />
              }
              variant="navigate"
              to="/dashboard/add_task"
            />
          )
        }
        defaultFilters={defaultFilters}
        extraTopContent={bulkAssignBar}
      />

      {/* Popups */}
      {popup && (
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
          message={`"האם לעדכן את " ${fullName} " כמטפל במשימה זו ?"`}
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
          message={`האם לעדכן את סטטוס משימה ל " ${newStatus} " ?`}
          mode="confirm"
          onConfirm={handleStatusSave}
          onClose={() => {
            setStatusToSave(null);
            setNewStatus(null);
          }}
        />
      )}

      {taskToDelete && (
        <Popup
          title="ביטול משימה"
          message={`האם לבטל משימה מספר [ ${taskToDelete} ] ?`}
          mode="confirm"
          onConfirm={handleDelete}
          onClose={() => setTaskToDelete(null)}
        />
      )}

      {bulkAssignConfirm && (
        <Popup
          title="אישור שיוך מרובה"
          message={`האם לשייך ${selectedTasks.length} משימות?`}
          mode="confirm"
          onConfirm={handleBulkAssign}
          onClose={() => setBulkAssignConfirm(false)}
        />
      )}
    </div>
  );
}
