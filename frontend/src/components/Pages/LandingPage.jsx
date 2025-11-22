import React, { useState, useEffect } from "react";
import { api } from "utils"; // אם יש לך utility כזה, או פשוט fetch

export default function LandingPage() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    city: "",
    course: "",
    source: "דף נחיתה",
  });

  const [projects, setProjects] = useState([]);
  const [cities] = useState(["תל אביב", "חיפה", "ירושלים", "באר שבע", "אשדוד"]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects"); // או כל API שיש לך לפרויקטים
      if (res.data.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת פרויקטים:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("🟢 שולח נתונים:", form);

      await api.post("/public/landing-leads", form);
      alert("פנייתך נשלחה בהצלחה!");
      setForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        city: "",
        course: "",
        source: "דף נחיתה",
      });
    } catch (err) {
      console.error("שגיאה בשליחת פנייה:", err);
      alert("אירעה שגיאה בשליחת הטופס");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white mt-10 rounded shadow text-right">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        השארת פרטים - מכללת לינקס
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 font-rubik">
        <div>
          <label className="block mb-1">שם פרטי</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">שם משפחה</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">טלפון</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            pattern="[0-9]{9,10}"
            required
          />
        </div>

        <div>
          <label className="block mb-1">מייל</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block mb-1">עיר</label>
          <select
            name="city"
            value={form.city}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">בחר עיר</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1">בחר קורס</label>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">בחר קורס</option>
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_name}>
                {p.project_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          שלח פנייה
        </button>
      </form>
    </div>
  );
}
