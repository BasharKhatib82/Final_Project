import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddAttendance = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    date: "",
    check_in: "",
    check_out: "",
    status: "נוכח",
    notes: "", // ✅ הוספת הערות
  });

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];
  const isSpecialStatus = specialStatuses.includes(form.status);

  useEffect(() => {
    axios
      .get("http://localhost:8801/users/active", { withCredentials: true })
      .then((res) => {
        if (res.data.Status) setUsers(res.data.Result);
        else alert("שגיאה בטעינת עובדים");
      })
      .catch(() => alert("שגיאה בעת טעינת העובדים"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && specialStatuses.includes(value)
        ? { check_in: "", check_out: "" }
        : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["user_id", "date", "status"];
    for (let field of requiredFields) {
      if (!form[field]) return alert(`שדה חובה חסר: ${field}`);
    }

    if (!isSpecialStatus && (!form.check_in || !form.check_out)) {
      return alert("יש להזין שעת כניסה ויציאה");
    }

    axios
      .post("http://localhost:8801/attendance/add", form, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.Status) navigate("/dashboard/attendance");
        else alert("שגיאה: " + res.data.Error);
      })
      .catch(() => alert("אירעה שגיאה בשמירה"));
  };

  return (
    <div className="flex justify-center items-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/85 shadow-md rounded-lg p-6 space-y-3"
      >
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 text-center mb-2">
          הוספת רישום נוכחות
        </h2>

        {/* עובד */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">
            בחר עובד
          </label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="">-- בחר עובד --</option>
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* תאריך */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">תאריך</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* סטטוס */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">סטטוס</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="נוכח">נוכח</option>
            <option value="חופשה">חופשה</option>
            <option value="מחלה">מחלה</option>
            <option value="היעדרות">היעדרות</option>
          </select>
        </div>

        {/* שעות כניסה/יציאה */}
        {!isSpecialStatus && (
          <>
            <div>
              <label className="font-rubik block mb-0.5 font-medium">
                שעת כניסה
              </label>
              <input
                type="time"
                name="check_in"
                value={form.check_in}
                onChange={handleChange}
                className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="font-rubik block mb-0.5 font-medium">
                שעת יציאה
              </label>
              <input
                type="time"
                name="check_out"
                value={form.check_out}
                onChange={handleChange}
                className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </>
        )}

        {/* ✅ הערות */}
        <div>
          <label className="font-rubik block mb-0.5 font-medium">הערות</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows="2"
            className="font-rubik text-sm w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
            placeholder="הזן הערה (אופציונלי)..."
          />
        </div>

        <button
          type="submit"
          className="font-rubik w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200 font-medium"
        >
          שמור רישום
        </button>
      </form>
    </div>
  );
};

export default AddAttendance;
