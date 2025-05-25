import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [formData, setFormData] = useState({
    business_name: "",
    address: "",
    phone: "",
    logo: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const res = await axios.get("http://localhost:8801/business/1");
      setFormData(res.data.Business);
      setLoading(false);
    } catch (err) {
      console.error("שגיאה בשליפת פרטי עסק:", err);
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
      alert("🎉 פרטי העסק עודכנו בהצלחה");
    } catch (err) {
      console.error("שגיאה בעדכון פרטי עסק:", err);
      alert("שגיאה בעדכון פרטי עסק");
    }
  };

  if (loading) return <p>טוען פרטי עסק...</p>;

  return (
    <form className="update-role-form" onSubmit={handleSubmit}>
      <h2 className="title">הגדרות חשבון - פרטי עסק</h2>

      <label>שם העסק</label>
      <input
        type="text"
        name="business_name"
        value={formData.business_name}
        onChange={handleChange}
        required
      />

      <label>כתובת</label>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />

      <label>טלפון</label>
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />

      <label>כתובת לוגו (URL)</label>
      <input
        type="text"
        name="logo"
        value={formData.logo}
        onChange={handleChange}
      />

      {formData.logo && (
        <div style={{ textAlign: "center", margin: "1rem 0" }}>
          <img
            src={formData.logo}
            alt="לוגו עסק"
            style={{ maxWidth: "200px", borderRadius: "10px" }}
          />
        </div>
      )}

      <button className="btn-update" type="submit">
        עדכון פרטי עסק
      </button>
    </form>
  );
};

export default Profile;
