import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: "",
    date: "",
    check_in: "",
    check_out: "",
    status: "נוכח",
    notes: "",
  });

  const specialStatuses = ["חופשה", "מחלה", "היעדרות"];

  useEffect(() => {
    axios
      .get("http://localhost:8801/users/active", { withCredentials: true })
      .then((res) => {
        if (res.data.Status) setUsers(res.data.Result);
      });

    axios
      .get(`http://localhost:8801/attendance/${id}`, { withCredentials: true })
      .then((res) => {
        if (res.data.Status) {
          const data = res.data.Result;
          const formattedDate = data.date?.split("T")[0] || "";

          setForm({
            user_id: data.user_id,
            date: formattedDate,
            check_in: data.check_in || "",
            check_out: data.check_out || "",
            status: data.status,
            notes: data.notes || "",
          });
        }
      })
      .catch((err) => {
        alert("שגיאה בטעינת פרטי הנוכחות");
        console.error(err);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === "status" && specialStatuses.includes(value)) {
      updated.check_in = "";
      updated.check_out = "";
    }

    setForm(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isSpecial = specialStatuses.includes(form.status);

    if (!form.user_id || !form.date || !form.status) {
      return alert("נא למלא את כל שדות החובה");
    }

    if (!isSpecial && (!form.check_in || !form.check_out)) {
      return alert("יש להזין שעת כניסה ויציאה");
    }

    const payload = {
      ...form,
      check_in: isSpecial ? null : form.check_in,
      check_out: isSpecial ? null : form.check_out,
    };

    axios
      .put(`http://localhost:8801/attendance/edit/${id}`, payload, {
        withCredentials: true,
      })
      .then(() => {
        alert("הנוכחות עודכנה בהצלחה");
        navigate("/dashboard/attendance");
      })
      .catch((err) => {
        alert("שגיאה בעדכון הנתונים");
        console.error(err);
      });
  };

  return (
    <div className="flex justify-center pt-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow space-y-3 text-right"
      >
        <h2 className="text-xl font-bold text-center text-blue-700">
          עריכת רישום נוכחות
        </h2>

        <div>
          <label className="block mb-1 font-medium">עובד</label>
          <select
            name="user_id"
            value={form.user_id}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          >
            <option value="">-- בחר עובד --</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">תאריך</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          />
        </div>

        {!specialStatuses.includes(form.status) && (
          <>
            <div>
              <label className="block mb-1 font-medium">שעת כניסה</label>
              <input
                type="time"
                name="check_in"
                value={form.check_in}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-sm"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">שעת יציאה</label>
              <input
                type="time"
                name="check_out"
                value={form.check_out}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded text-sm"
              />
            </div>
          </>
        )}

        <div>
          <label className="block mb-1 font-medium">סטטוס</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
          >
            <option value="נוכח">נוכח</option>
            <option value="חופשה">חופשה</option>
            <option value="מחלה">מחלה</option>
            <option value="היעדרות">היעדרות</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">הערות (לא חובה)</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded text-sm"
            rows="2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          שמור שינויים
        </button>
      </form>
    </div>
  );
};

export default EditAttendance;
