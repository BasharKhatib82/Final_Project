import React, { useEffect, useState } from "react";
import axios from "axios";
import Popup from "../Tools/Popup.jsx";
import { useUser } from "../Tools/UserContext.jsx";

const api = process.env.REACT_APP_API_URL;

const AccountSettings = () => {
  const { user } = useUser(); // 🟢 נקח את המשתמש מהקונטקסט
  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    role_name: "",
    phone_number: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [popupData, setPopupData] = useState(null);

  useEffect(() => {
    if (user?.user_id) {
      fetchUser(user.user_id);
    }
  }, [user]);

  const fetchUser = async (id) => {
    try {
      const res = await axios.get(`${api}/users/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error("שגיאה בשליפת פרטי משתמש:", err);
      setPopupData({
        title: "שגיאה",
        message: "לא ניתן לטעון פרטי משתמש",
        mode: "error",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `${api}/users/${formData.user_id}`,
        formData,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        setPopupData({
          title: "הצלחה",
          message: "פרטי המשתמש עודכנו בהצלחה",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה בעדכון פרטי המשתמש",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בעדכון פרטי משתמש:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון פרטי המשתמש",
        mode: "error",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPopupData({
        title: "שגיאה",
        message: "הסיסמאות החדשות אינן תואמות",
        mode: "error",
      });
    }

    try {
      const res = await axios.put(
        `${api}/users/change-password/${formData.user_id}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        setPopupData({
          title: "הצלחה",
          message: "הסיסמה עודכנה בהצלחה",
          mode: "success",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה בעדכון סיסמה",
          mode: "error",
        });
      }
    } catch (err) {
      console.error("שגיאה בעדכון סיסמה:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון סיסמה",
        mode: "error",
      });
    }
  };

  if (!formData.user_id) {
    return <p className="text-center text-blue-600">טוען פרטי משתמש...</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        הגדרות חשבון
      </h2>

      {/* טופס פרטי משתמש */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-1">מזהה משתמש:</label>
          <input
            value={formData.user_id}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1">שם פרטי:</label>
          <input
            value={formData.first_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1">שם משפחה:</label>
          <input
            value={formData.last_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block mb-1">תפקיד:</label>
          <input
            value={formData.role_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1">טלפון:</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1">אימייל:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          עדכון פרטים
        </button>
      </form>

      {/* שינוי סיסמה */}
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-3">שינוי סיסמה</h3>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            placeholder="סיסמה נוכחית"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                currentPassword: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="סיסמה חדשה"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="אימות סיסמה חדשה"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({
                ...passwordData,
                confirmPassword: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
          >
            עדכון סיסמה
          </button>
        </form>
      </div>

      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={() => setPopupData(null)}
        />
      )}
    </div>
  );
};

export default AccountSettings;
