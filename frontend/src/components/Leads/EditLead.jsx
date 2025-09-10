// frontend/src/pages/Leads/EditLead.jsx

/**
 * קומפוננטה: EditLead
 * ---------------------
 * - עריכת פרטי פנייה קיימת.
 * - טוען פרויקטים, משתמשים, ושדות של הפנייה לעריכה.
 * - מאפשר עדכון של סטטוס, נציג, פרויקט, פרטי לקוח.
 * - שמירה מתבצעת רק לאחר אישור המשתמש.
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddSaveButton, ExitButton } from "components/Buttons";
import { Popup } from "components/Tools";
import { api, extractApiError } from "utils";

export default function EditLead() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone_number: "",
    first_name: "",
    last_name: "",
    email: "",
    city: "",
    status: "חדש",
    project_id: "",
    user_id: "",
    created_at: "",
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLead();
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      if (res.data.success) {
        setForm(res.data.data);
      } else {
        setError(res.data.message || "שגיאה בטעינת הפנייה");
      }
    } catch (err) {
      setError(extractApiError(err, "שגיאה בטעינת הפנייה"));
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects/1");
      setProjects(res.data.data || []);
    } catch (err) {
      setError(extractApiError(err, "שגיאה בטעינת פרויקטים"));
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/active");
      setUsers(res.data.data || []);
    } catch (err) {
      setError(extractApiError(err, "שגיאה בטעינת עובדים"));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    //'phone_number' לוגיקה ספציפית עבור שדה
    if (name === "phone_number") {
      // מסנן רק ספרות ומגביל ל-10 תווים
      const sanitizedValue = value.replace(/[^0-9]/g, "");
      if (sanitizedValue.length <= 10) {
        newValue = sanitizedValue;
      } else {
        // אם כבר הגענו ל-10 ספרות, אל תעדכן את הערך
        return;
      }
    }

    // עבור כל שדה state עדכון מצב ה
    setForm({
      ...form,
      [name]: newValue,
    });
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    if (!form.phone_number || !form.project_id || !form.status) {
      setError("נא למלא את כל השדות החובה");
      return;
    }

    setError("");
    setShowConfirmPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await api.put(`/leads/edit/${id}`, form);
      if (res.data.success) {
        setSuccessPopup(true);
        setShowConfirmPopup(false);
      } else {
        setError(res.data.message || "שגיאה בעדכון פנייה");
        setShowConfirmPopup(false);
      }
    } catch (err) {
      setError(extractApiError(err, "שגיאה בעדכון פנייה"));
      setShowConfirmPopup(false);
    }
  };

  return (
    <div className="p-6 font-rubik text-right max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        עריכת פנייה
      </h2>

      <form
        onSubmit={handleConfirm}
        className="bg-white/85 p-6 rounded-lg shadow-lg space-y-4"
      >
        <div>
          <label className="block mb-1 font-semibold">מספר טלפון:</label>
          <input
            type="number"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-semibold">שם פרטי:</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">שם משפחה:</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">אימייל:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">עיר:</label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">סטטוס:</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופל">טופל</option>
            <option value="בוטלה">בוטלה</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">פרויקט:</label>
          <select
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">בחר פרויקט</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">נציג מטפל:</label>
          <select
            name="user_id"
            value={form.user_id || ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="">ללא נציג</option>
            {users.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.first_name} {u.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">תאריך יצירה:</label>
          <input
            type="text"
            readOnly
            value={
              form.created_at
                ? `${new Date(form.created_at).toLocaleDateString("he-IL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })} - שעה: ${new Date(form.created_at).toLocaleTimeString(
                    "he-IL",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}`
                : ""
            }
            className="w-full border p-2 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-center gap-4 mt-6">
          <AddSaveButton type="submit" label="עדכן פנייה" />
          <ExitButton label="ביטול" linkTo="/dashboard/leads" />
        </div>
      </form>

      {/* אישור עדכון פנייה  */}
      {showConfirmPopup && (
        <Popup
          title="אישור עדכון"
          message="האם אתה בטוח שברצונך לעדכן את פרטי הפנייה?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setShowConfirmPopup(false)}
        />
      )}

      {/* "הודעת הצלחה "עדכון פנייה */}
      {successPopup && (
        <Popup
          title="הצלחה"
          message="הפנייה עודכנה בהצלחה!"
          mode="success"
          onClose={() => {
            setSuccessPopup(false);
            navigate("/dashboard/leads");
          }}
        />
      )}
    </div>
  );
}
