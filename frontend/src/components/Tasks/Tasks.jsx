import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../Buttons/NavigationButton";
import DeleteButton from "../Buttons/DeleteButton";
import Popup from "../Tools/Popup";

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

  const api = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${api}/tasks`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        const updatedTasks = res.data.Result.map((task) => ({
          ...task,
          selectedRepId: task.user_id || "",
          selectedStatus: task.status,
        }));
        setTasks(updatedTasks);
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
      if (res.data.Status) {
        setUsers(res.data.Result);
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

      if (res.data.Status) {
        setTasks((prev) =>
          prev.map((task) =>
            task.task_id === taskToDelete
              ? { ...task, status: "בוטלה", selectedStatus: "בוטלה" }
              : task
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "המשימה בוטלה בהצלחה!",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || "שגיאה בביטול המשימה",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בביטול משימה:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בביטול משימה",
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
      setPopupData({
        title: "שגיאה",
        message: "יש לבחור משימות",
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
        `${api}/tasks/bulk-assign`,
        {
          taskIds: selectedTasks,
          user_id: bulkUserId === "null" ? null : bulkUserId,
        },
        { withCredentials: true }
      );

      if (res.data.Status) {
        fetchTasks();
        setSelectedTasks([]);
        setBulkUserId("");
        setPopupData({
          title: "הצלחה",
          message: "השיוך בוצע בהצלחה",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || "שגיאה בשיוך משימות",
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

      if (res.data.Status) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId
              ? {
                  ...task,
                  user_id: selectedRepId,
                  selectedRepId: selectedRepId,
                }
              : task
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
          message: res.data?.Error || "שגיאה בעדכון נציג",
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

      if (res.data.Status) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.task_id === taskId
              ? {
                  ...task,
                  status: selectedStatus,
                  selectedStatus: selectedStatus,
                }
              : task
          )
        );
        setPopupData({
          title: "הצלחה",
          message: "הסטטוס עודכן בהצלחה",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data?.Error || "שגיאה בעדכון סטטוס",
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

  const handleClosePopup = () => {
    setPopupData(null);
  };

  const filteredTasks = tasks.filter((task) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      task.task_title.toLowerCase().includes(search) ||
      task.description?.toLowerCase().includes(search);

    const matchStatus =
      statusFilter === "all"
        ? task.status !== "בוטלה"
        : task.status === statusFilter;

    const matchUser =
      repFilter === "all" ? true : String(task.user_id) === repFilter;

    return matchSearch && matchStatus && matchUser;
  });

  return (
    <div className="p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת משימות
      </h2>

      {/* Filters + Bulk Assign */}
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
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.first_name} {user.last_name}
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
            שייך את הנבחרות ({selectedTasks.length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg shadow-lg bg-white/85 mt-4">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
              <th className="p-2 border">✔️</th>
              <th className="p-2 border">מזהה</th>
              <th className="p-2 border">תיאור</th>
              <th className="p-2 border">תאריך יעד</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">נציג מטפל</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-red-500 p-4">
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
                    {new Date(task.due_date).toLocaleDateString("he-IL", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
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
                      {users.map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2 text-center flex flex-wrap justify-center gap-1">
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

      {/* Popups */}
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
