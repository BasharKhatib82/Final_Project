import React, { useState, useEffect } from "react";
import { api } from "utils";
import Select from "react-select"; // ✅ חדש
import axios from "axios"; // ✅ חדש

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
  const [citiesOptions, setCitiesOptions] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchCities(); 
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      if (res.data.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error("שגיאה בטעינת פרויקטים:", err);
    }
  };

  const fetchCities = async () => {
    setCitiesLoading(true);
    try {
      const res = await axios.get(
        "https://data.gov.il/api/3/action/datastore_search",
        {
          params: {
            resource_id: "d4901968-dad3-4845-a9b0-a57d027f11ab",
            limit: 5000,
          },
        }
      );

      const records = res.data?.result?.records || [];

      // רק שם עיר + הסרת כפילויות
      const uniqueNames = Array.from(
        new Set(records.map((r) => r?.שם_ישוב).filter(Boolean))
      );

      // יצירת options ל-react-select
      const options = uniqueNames
        .sort((a, b) => a.localeCompare(b, "he"))
        .map((name) => ({ value: name, label: name }));

      setCitiesOptions(options);
    } catch (err) {
      console.error("שגיאה בטעינת ערים:", err);
    } finally {
      setCitiesLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedProject = projects.find(
      (p) => p.project_name === form.course
    );
    if (!selectedProject) {
      alert("הקורס שנבחר לא קיים במערכת.");
      return;
    }

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone,
      email: form.email,
      city: form.city,
      source: form.source,
      project_name: form.course,
    };

    console.log("🟢 שולח נתונים:", payload);

    try {
      await api.post("/public/landing-leads", payload);
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
      alert("אירעה שגיאה בשליחת הפנייה");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 animate-fade-in">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center tracking-tight">
          ✨ הצטרפו להצלחה עם מכללת לינקס
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 font-rubik">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">שם פרטי</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">שם משפחה</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">טלפון</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                pattern="[0-9]{9,10}"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">אימייל</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">עיר</label>
              <Select
                options={citiesOptions}
                isLoading={citiesLoading}
                isSearchable
                isClearable
                placeholder="בחר עיר"
                noOptionsMessage={() => "לא נמצאו ערים"}
                value={citiesOptions.find((o) => o.value === form.city) || null}
                onChange={(selected) =>
                  setForm((prev) => ({ ...prev, city: selected?.value || "" }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">בחר קורס</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium py-3 rounded mt-4 transition-colors duration-200"
          >
            שלח פנייה
          </button>
        </form>
      </div>
    </div>
  );
}
