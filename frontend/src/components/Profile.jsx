import React, { useEffect, useState } from "react";
import axios from "axios";
import Popup from "./Tools/Popup";

const Profile = () => {
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    phone_number: "",
    address: "",
    city: "",
    logo: "",
  });

  const [loading, setLoading] = useState(true);
  const [popupData, setPopupData] = useState(null);

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const res = await axios.get("http://localhost:8801/users/business/");
      setFormData(res.data.Business);
    } catch (err) {
      console.error("שגיאה בשליפת פרטי עסק:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בשליפת פרטי העסק",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:8801/business/1", formData);
      setPopupData({
        title: "הצלחה",
        message: "🎉 פרטי העסק עודכנו בהצלחה",
        mode: "success",
      });
    } catch (err) {
      console.error("שגיאה בעדכון פרטי עסק:", err);
      setPopupData({
        title: "שגיאה",
        message: "שגיאה בעדכון פרטי העסק",
        mode: "error",
      });
    }
  };

  const handleClosePopup = () => {
    setPopupData(null);
  };

  if (loading)
    return (
      <p className="text-center text-blue-600 text-lg">טוען פרטי עסק...</p>
    );

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        הגדרות חשבון - פרטי עסק
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">שם העסק:</label>
          <input
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">אימייל:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">טלפון:</label>
          <input
            type="text"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">כתובת:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">עיר:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">כתובת לוגו (URL):</label>
          <input
            type="text"
            name="logo"
            value={formData.logo}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        {formData.logo && (
          <div className="text-center mt-4">
            <img
              src={formData.logo}
              alt="לוגו עסק"
              className="max-w-[200px] mx-auto rounded-lg border shadow"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
        >
          עדכון פרטי עסק
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
