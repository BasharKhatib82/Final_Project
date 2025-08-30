import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Tools/UserContext";
import ExitButton from "../Buttons/ExitButton";
import AddButton from "../Buttons/AddSaveButton";
import Popup from "../Tools/Popup";

const api = process.env.REACT_APP_API_URL;

const AddLead = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    phone_number: "",
    project_id: "",
    status: "חדש",
    first_name: "",
    last_name: "",
    email: "",
    city: "",
    user_id: null,
  });

  const [clientExists, setClientExists] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${api}/projects/active`, {
        withCredentials: true,
      });
      setProjects(res.data.Result);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${api}/users/active`, {
        withCredentials: true,
      });
      setUsers(res.data.Result);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handlePhoneBlur = async () => {
    try {
      const res = await axios.get(
        `${api}/clients/by-phone/${form.phone_number}`,
        { withCredentials: true }
      );
      if (res.data.Status) {
        const c = res.data.Result;
        setForm((prev) => ({
          ...prev,
          first_name: c.first_name,
          last_name: c.last_name,
          email: c.email,
          city: c.city,
        }));
        setClientExists(true);
        setError("");
      } else {
        setClientExists(false);
      }
    } catch (err) {
      console.error("Error checking client:", err);
    }
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
    const leadData = {
      ...form,
      user_id: form.user_id || null,
    };

    try {
      const res = await axios.post(`${api}/leads/add`, leadData, {
        withCredentials: true,
      });
      if (res.data.Status) {
        setShowConfirmPopup(false);
        setSuccessPopup(true);
      } else {
        setError(res.data.Error || "שגיאה בשמירת פנייה");
        setShowConfirmPopup(false);
      }
    } catch (err) {
      console.error("Error submitting lead:", err);
      setError("שגיאה בשמירת פנייה");
      setShowConfirmPopup(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto font-rubik">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        הוספת פנייה חדשה
      </h2>

      <form
        onSubmit={handleConfirm}
        className="bg-white/85 p-6 rounded-lg shadow-lg space-y-4"
      >
        <div>
          <label className="block mb-1 font-semibold">מספר טלפון:</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            onBlur={handlePhoneBlur}
          />
        </div>

        {!clientExists && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-semibold">שם פרטי:</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">שם משפחה:</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-semibold">אימייל:</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">עיר:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </>
        )}

        <div>
          <label className="block mb-1 font-semibold">פרויקט:</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.project_id}
            onChange={(e) => setForm({ ...form, project_id: e.target.value })}
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
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.user_id || ""}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
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
          <label className="block mb-1 font-semibold">סטטוס:</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופל">טופל</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="text-center flex justify-center gap-4">
          <AddButton label="שמור פנייה" type="submit" />
          <ExitButton label="ביטול" linkTo="/dashboard/leads" />
        </div>
      </form>

      {showConfirmPopup && (
        <Popup
          title="אישור שמירה"
          message="האם אתה בטוח שברצונך לשמור את הפנייה?"
          mode="confirm"
          onConfirm={handleSubmit}
          onClose={() => setShowConfirmPopup(false)}
        />
      )}

      {successPopup && (
        <Popup
          title="הצלחה"
          message="הפנייה נשמרה בהצלחה!"
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

export default AddLead;
