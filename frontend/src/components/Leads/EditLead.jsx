import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Button from "../Buttons/AddSaveButton";

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
  });
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchLead();
    fetchProjects();
  }, []);

  const fetchLead = async () => {
    try {
      const res = await axios.get(`http://localhost:8801/leads/${id}`, {
        withCredentials: true,
      });
      setForm(res.data.lead);
    } catch (err) {
      console.error("שגיאה בטעינת הפנייה:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get("http://localhost:8801/projects/active", {
        withCredentials: true,
      });
      setProjects(res.data.Result);
    } catch (err) {
      console.error("שגיאה בטעינת פרויקטים:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:8801/leads/edit/${id}`,
        form,
        { withCredentials: true }
      );
      if (res.data.Status) {
        navigate("/dashboard/leads");
      }
    } catch (err) {
      console.error("שגיאה בעדכון פנייה:", err);
    }
  };

  return (
    <div className="p-6 font-rubik text-right max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        עריכת פנייה
      </h2>
      <form onSubmit={handleSubmit} className="bg-white/85 p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            placeholder="טלפון"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            placeholder="שם פרטי"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            placeholder="שם משפחה"
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="אימייל"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="עיר"
            className="border p-2 rounded"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="חדש">חדש</option>
            <option value="בטיפול">בטיפול</option>
            <option value="טופל">טופל</option>
          </select>
          <select
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            className="border p-2 rounded"
          >
            <option value="">בחר פרויקט</option>
            {projects.map((project) => (
              <option key={project.project_id} value={project.project_id}>
                {project.project_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-6 text-center">
          <Button type="submit" label="עדכן פנייה" />
        </div>
      </form>
    </div>
  );
};

export default EditLead;
