import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NavigationButton, DeleteButton } from "components/Buttons";
import { Popup } from "components/Tools";
import { ReportProvider } from "../Reports/ReportContext";
import ReportExport from "../Reports/ReportExport";
import ReportEmail from "../Reports/ReportEmail";

const api = process.env.REACT_APP_API_URL;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkUserId, setBulkUserId] = useState("");
  const [bulkAssignConfirm, setBulkAssignConfirm] = useState(false);
  const [repToSave, setRepToSave] = useState(null);
  const [newRepId, setNewRepId] = useState(null);
  const [statusToSave, setStatusToSave] = useState(null);
  const [newStatusValue, setNewStatusValue] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${api}/tasks`, { withCredentials: true });
      if (res.data.success) {
        const updated = res.data.data.map((task) => ({
          ...task,
          selectedRepId: task.user_id || "",
          selectedStatus: task.status,
        }));
        setTasks(updated);
      }
    } catch (err) {
      console.error("שגיאה בטעינת משימות:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${api}/users/active`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת משתמשים:", err);
    }
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    try {
      const res = await axios.delete(`${api}/tasks/delete/${taskToDelete}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.task_id === taskToDelete
              ? { ...t, status: "בוטלה", selectedStatus: "בוטלה" }
              : t
          )
        );
        setPopupData({
          title: "הצלחה",
          message: res.data.message,
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message,
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בביטול המשימה",
        mode: "error",
      });
    } finally {
      setTaskToDelete(null);
    }
  };

  const handleSelectTask = (taskId) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleBulkAssignConfirm = () => {
    if (selectedTasks.length === 0) {
      return setPopupData({
        title: "שגיאה",
        message: "יש לבחור משימות",
        mode: "error",
      });
    }
    if (!bulkUserId) {
      return setPopupData({
        title: "שגיאה",
        message: "יש לבחור נציג לשיוך",
        mode: "error",
      });
    }
    setBulkAssignConfirm(true);
  };

  const handleBulkAssign = async () => {
    try {
      const res = await axios.put(
        `${api}/tasks/bulk-assign`,
        { taskIds: selectedTasks, user_id: bulkUserId || null },
        { withCredentials: true }
      );
      if (res.data.success) {
        fetchTasks();
        setSelectedTasks([]);
        setBulkUserId("");
        setPopupData({
          title: "הצלחה",
          message: res.data.message,
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message,
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בשיוך משימות",
        mode: "error",
      });
    } finally {
      setBulkAssignConfirm(false);
    }
  };

  const handleRepSelect = (taskId, newUserId) => {
    setRepToSave(taskId);
    setNewRepId(newUserId);
  };

  const handleRepSave = async (taskId, selectedRepId) => {
    try {
      const res = await axios.put(
        `${api}/tasks/update-rep/${taskId}`,
        { user_id: selectedRepId },
        { withCredentials: true }
      );
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.task_id === taskId
              ? { ...t, user_id: selectedRepId, selectedRepId }
              : t
          )
        );
        setPopupData({
          title: "הצלחה",
          message: res.data.message,
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message,
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

  const handleStatusSelect = (taskId, newStatus) => {
    setStatusToSave(taskId);
    setNewStatusValue(newStatus);
  };

  const handleStatusSave = async (taskId, selectedStatus) => {
    try {
      const res = await axios.put(
        `${api}/tasks/update-status/${taskId}`,
        { status: selectedStatus },
        { withCredentials: true }
      );
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.task_id === taskId
              ? { ...t, status: selectedStatus, selectedStatus }
              : t
          )
        );
        setPopupData({
          title: "הצלחה",
          message: res.data.message,
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message,
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

  const handleClosePopup = () => setPopupData(null);

  const filteredTasks = tasks.filter((t) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      t.task_title.toLowerCase().includes(search) ||
      t.description?.toLowerCase().includes(search);
    const matchStatus =
      statusFilter === "all" ? t.status !== "בוטלה" : t.status === statusFilter;
    const matchUser = repFilter === "all" || String(t.user_id) === repFilter;
    return matchSearch && matchStatus && matchUser;
  });

  // עמודות ייצוא
  const columns = [
    { key: "task_id", label: "מזהה", export: (r) => r.task_id },
    { key: "task_title", label: "כותרת", export: (r) => r.task_title },
    {
      key: "due_date",
      label: "תאריך יעד",
      export: (r) =>
        new Date(r.due_date).toLocaleDateString("he-IL", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
    },
    { key: "status", label: "סטטוס", export: (r) => r.status },
    {
      key: "assigned",
      label: "נציג מטפל",
      export: (r) => {
        const u = users.find((u) => u.user_id === r.user_id);
        return u ? `${u.first_name} ${u.last_name}` : "ללא";
      },
    },
  ];

  return (
    <div className="p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת משימות
      </h2>

      {/* 🔹 סרגל מסננים */}
      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-4">
        <NavigationButton
          linkTo="/dashboard/add_task"
          label="הוספת משימה חדשה"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="all">כל הסטטוסים</option>
          <option value="חדש">חדש</option>
          <option value="בתהליך">בתהליך</option>
          <option value="הושלם">הושלם</option>
          <option value="בוטלה">בוטלה</option>
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

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 חיפוש לפי נושא או תיאור..."
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500"
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
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleBulkAssignConfirm}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            שייך את הנבחרות ({selectedTasks.length})
          </button>
        </div>
      </div>

      {/* 🔹 סרגל ייצוא */}
      <ReportProvider
        title="רשימת משימות"
        columns={columns}
        rows={filteredTasks}
      >
        <div className="flex items-center flex-wrap gap-4 bg-white/85 rounded-lg p-3 mb-4 shadow-sm">
          <ReportExport apiBase={api} />
          <ReportEmail apiBase={api} />
        </div>
      </ReportProvider>

      {/* 🔹 טבלה */}
      <div className="overflow-auto rounded-lg shadow-lg bg-white/85 mt-4">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              <th className="p-2 border">✔️</th>
              <th className="p-2 border">מזהה</th>
              <th className="p-2 border">כותרת</th>
              <th className="p-2 border">תאריך יעד</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">נציג מטפל</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-red-500 p-4">
                  אין משימות להצגה
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.task_id} className="hover:bg-blue-50 transition">
                  <td className="border p-2">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.task_id)}
                      onChange={() => handleSelectTask(task.task_id)}
                    />
                  </td>
                  <td className="border p-2">{task.task_id}</td>
                  <td className="border p-2">{task.task_title}</td>
                  <td className="border p-2">
                    {new Date(task.due_date).toLocaleDateString("he-IL")}
                  </td>
                  <td className="border p-2">
                    <select
                      value={task.selectedStatus}
                      onChange={(e) =>
                        handleStatusSelect(task.task_id, e.target.value)
                      }
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="חדש">חדש</option>
                      <option value="בתהליך">בתהליך</option>
                      <option value="הושלם">הושלם</option>
                      <option value="בוטלה">בוטלה</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    <select
                      value={task.selectedRepId}
                      onChange={(e) =>
                        handleRepSelect(task.task_id, e.target.value)
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
                  </td>
                  <td className="border p-2 flex flex-wrap justify-center gap-1">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/details_task/${task.task_id}`)
                      }
                      className="bg-slate-600 text-white px-2 py-1 rounded hover:bg-slate-700"
                    >
                      פתח משימה
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/dashboard/edit_task/${task.task_id}`)
                      }
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      עריכה
                    </button>
                    {task.status !== "בוטלה" && (
                      <DeleteButton
                        onClick={() => setTaskToDelete(task.task_id)}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 פופאפים */}
      {taskToDelete && (
        <Popup
          title="אישור ביטול משימה"
          message="האם אתה בטוח שברצונך לבטל משימה זו?"
          mode="confirm"
          onConfirm={handleDelete}
          onClose={() => setTaskToDelete(null)}
        />
      )}
      {bulkAssignConfirm && (
        <Popup
          title="אישור שיוך מרובה"
          message={`האם אתה בטוח שברצונך לשייך ${selectedTasks.length} משימות?`}
          mode="confirm"
          onConfirm={handleBulkAssign}
          onClose={() => setBulkAssignConfirm(false)}
        />
      )}
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
      {statusToSave && (
        <Popup
          title="אישור שינוי סטטוס"
          message="האם אתה בטוח שברצונך לעדכן את סטטוס המשימה?"
          mode="confirm"
          onConfirm={() => handleStatusSave(statusToSave, newStatusValue)}
          onClose={() => {
            setStatusToSave(null);
            setNewStatusValue(null);
          }}
        />
      )}
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default Tasks;
