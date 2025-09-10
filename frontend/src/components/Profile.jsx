/**
 * קומפוננטה: Profile (הגדרות חשבון)
 * ----------------------------------
 * מטרות:
 * 1. הצגת פרטי המשתמש המחובר (שם, אימייל, תפקיד, טלפון).
 * 2. עדכון אימייל ומספר טלפון.
 * 3. שינוי סיסמה עם אימות סיסמה נוכחית.
 * 4. Popup הצגת הודעות הצלחה/שגיאה עם .
 *
 * עזרים:
 * - useUser (קבלת פרטי המשתמש)
 * - api (קריאות לשרת)
 * - Popup (הודעות)
 */

import React, { useEffect, useState } from "react";
import { Popup, useUser } from "components/Tools";
import { api } from "utils";

const Profile = () => {
  const { user } = useUser();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role_name: "",
  });

  const [loading, setLoading] = useState(true);
  const [popupData, setPopupData] = useState(null);

  // שינוי סיסמה
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  //  שליפת פרטי המשתמש מהשרת
  const fetchUserProfile = async () => {
    try {
      const res = await api.get(`/users/${user.user_id}`);
      if (res.data.success) {
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error("שגיאה בשליפת פרטי משתמש:", err);
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

  //  שליחת עדכון פרטי משתמש
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.user_id}`, formData);
      setPopupData({
        title: "הצלחה",
        message: "פרטי המשתמש עודכנו בהצלחה",
        mode: "success",
      });
    } catch (err) {
      console.error("שגיאה בעדכון פרטי משתמש:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון פרטי המשתמש",
        mode: "error",
      });
    }
  };

  //  שליחת בקשה לשינוי סיסמה
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
      await api.put(`/users/change-password/${user.user_id}`, passwordData);
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
      setShowPasswordForm(false);
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: err.response?.data?.message || "שגיאה בשינוי סיסמה",
        mode: "error",
      });
    }
  };

  const handleClosePopup = () => setPopupData(null);

  if (loading) return <p className="text-center text-blue-600">טוען...</p>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        הגדרות חשבון
      </h2>

      {/* טופס פרטי קשר */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">שם פרטי:</label>
          <input
            type="text"
            value={formData.first_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">שם משפחה:</label>
          <input
            type="text"
            value={formData.last_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">תפקיד:</label>
          <input
            type="text"
            value={formData.role_name}
            disabled
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">אימייל:</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">טלפון:</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number || ""}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          עדכון פרטים
        </button>
      </form>

      {/* שינוי סיסמה */}
      <div className="mt-6 text-center">
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
          >
            שינוי סיסמה
          </button>
        ) : (
          <div className="mt-4 p-4 border rounded bg-gray-50 space-y-3">
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
            />
            <input
              type="password"
              placeholder="סיסמה חדשה"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full border rounded px-3 py-2"
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
            />

            <div className="flex gap-3">
              <button
                onClick={handlePasswordChange}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              >
                עדכן סיסמה
              </button>
              <button
                onClick={() => setShowPasswordForm(false)}
                className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded"
              >
                ביטול
              </button>
            </div>
          </div>
        )}
      </div>

      {/* פופאפ הודעה */}
      {popupData && (
        <Popup
          title={popupData.title}
          message={popupData.message}
          mode={popupData.mode}
          onClose={handleClosePopup}
          autoClose={3000}
        />
      )}
    </div>
  );
};

export default Profile;
