import React, { useEffect, useState } from "react";
import axios from "axios";
import Popup from "./Tools/Popup";
import jwtDecode from "jwt-decode"; // npm i jwt-decode

const api = process.env.REACT_APP_API_URL;

const Profile = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    first_name: "",
    last_name: "",
    role_name: "",
    email: "",
    phone_number: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [popupData, setPopupData] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    getUserIdFromToken();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId);
    }
  }, [userId]);

  // 🟢 חילוץ user_id מהטוקן
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem("token"); // או בקוקי – תלוי איך שמרת
      if (!token) return;
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id);
    } catch (err) {
      console.error("❌ שגיאה בפענוח טוקן:", err);
    }
  };

  // 🟢 שליפת פרטי המשתמש
  const fetchUserInfo = async (id) => {
    try {
      const res = await axios.get(`${api}/users/${id}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error("❌ שגיאה בשליפת פרטי משתמש:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בשליפת פרטי המשתמש",
        mode: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ עדכון טלפון / מייל בלבד
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, phone_number } = formData;
      await axios.put(
        `${api}/users/edit/${userId}`,
        { email, phone_number },
        { withCredentials: true }
      );
      setPopupData({
        title: "הצלחה",
        message: "🎉 פרטי החשבון עודכנו בהצלחה",
        mode: "success",
      });
    } catch (err) {
      console.error("❌ שגיאה בעדכון פרטי חשבון:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון פרטי החשבון",
        mode: "error",
      });
    }
  };

  // ✅ שינוי סיסמה
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPopupData({
        title: "שגיאה",
        message: "הסיסמאות החדשות אינן תואמות",
        mode: "error",
      });
    }
    try {
      await axios.put(`${api}/users/change-password/${userId}`, passwordData, {
        withCredentials: true,
      });
      setPopupData({
        title: "הצלחה",
        message: "🔑 הסיסמה שונתה בהצלחה",
        mode: "success",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("❌ שגיאה בשינוי סיסמה:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בשינוי הסיסמה",
        mode: "error",
      });
    }
  };

  const handleClosePopup = () => setPopupData(null);

  if (loading)
    return (
      <p className="text-center text-blue-600 text-lg">טוען פרטי משתמש...</p>
    );

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        הגדרות חשבון - פרטי משתמש
      </h2>

      {/* פרטי משתמש */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">תעודת זהות:</label>
          <input
            type="text"
            value={formData.user_id}
            disabled
            className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">שם פרטי:</label>
          <input
            type="text"
            value={formData.first_name}
            disabled
            className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">שם משפחה:</label>
          <input
            type="text"
            value={formData.last_name}
            disabled
            className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">תפקיד:</label>
          <input
            type="text"
            value={formData.role_name}
            disabled
            className="w-full bg-gray-100 border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">אימייל:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">טלפון:</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
        >
          עדכון פרטי קשר
        </button>
      </form>

      {/* שינוי סיסמה */}
      <h3 className="font-rubik text-xl font-semibold text-gray-700 mt-8 mb-4 text-center">
        שינוי סיסמה
      </h3>
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">סיסמה נוכחית:</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">סיסמה חדשה:</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">אימות סיסמה חדשה:</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
        >
          עדכון סיסמה
        </button>
      </form>

      {/* פופאפ */}
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

export default Profile;
