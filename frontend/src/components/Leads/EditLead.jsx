import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AddButton from "../Buttons/AddSaveButton";
import ExitButton from "../Buttons/ExitButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_BACKEND;

const EditLead = () => {
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
      const res = await axios.get(`${api}/leads/${id}`, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setForm(res.data.Result);
      } else {
        console.error("שגיאה בטעינת הפנייה:", res.data.Error);
      }
    } catch (err) {
      console.error("שגיאה בטעינת הפנייה:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${api}/projects/active`, {
        withCredentials: true,
      });
      setProjects(res.data.Result);
    } catch (err) {
      console.error("שגיאה בטעינת פרויקטים:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${api}/users/active`, {
        withCredentials: true,
      });
      setUsers(res.data.Result);
    } catch (err) {
      console.error("שגיאה בטעינת עובדים:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!form.phone_number || !form.project_id || !form.status) {
      setError("נא למלא את כל השדות החובה");
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.put(`${api}/leads/edit/${id}`, form, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setShowConfirmPopup(false);
        setSuccessPopup(true);
      } else {
        setError(res.data.Error || "שגיאה בעדכון פנייה");
        setShowConfirmPopup(false);
      }
    } catch (err) {
      console.error("שגיאה בעדכון פנייה:", err);
      setError("שגיאה בעדכון פנייה");
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
            type="text"
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
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
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
            {users.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">תאריך יצירה:</label>
          <input
            type="text"
            value={
              form.created_at
                ? `${new Date(form.created_at).toLocaleDateString("he-IL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })} - שעה: ${new Date(form.created_at).toLocaleTimeString(
                    "he-IL",
                    { hour: "2-digit", minute: "2-digit" }
                  )}`
                : ""
            }
            readOnly
            className="w-full border p-2 rounded bg-gray-100 text-gray-600"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex justify-center gap-4 mt-6">
          <AddButton type="submit" label="עדכן פנייה" />
          <ExitButton label="ביטול" linkTo="/dashboard/leads" />
        </div>
      </form>

      {showConfirmPopup && (
        <Popup
          title="אישור עדכון"
          message="האם אתה בטוח שברצונך לעדכן את פרטי הפנייה?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setShowConfirmPopup(false)}
        />
      )}

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
};

export default EditLead;
