import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationButton from "../Buttons/NavigationButton";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const navigate = useNavigate();

  useEffect(() => {
    checkPermissions();
    fetchProjects();
  }, []);

  const checkPermissions = async () => {
    try {
      const res = await axios.get("http://localhost:8801/auth/check", {
        withCredentials: true,
      });
      if (!res.data.loggedIn || res.data.user.role_id !== 1) {
        navigate("/unauthorized");
      }
    } catch (err) {
      console.error("שגיאה בבדיקת הרשאות", err);
      navigate("/unauthorized");
    }
  };

  const fetchProjects = () => {
    axios
      .get("http://localhost:8801/projects", { withCredentials: true })
      .then((res) => {
        setProjects(res.data.Result || []);
      })
      .catch((err) => {
        console.error("שגיאה בטעינת פרויקטים:", err);
      });
  };

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = project.project_name.toLowerCase().includes(term);
    const descMatch = project.project_description?.toLowerCase().includes(term);
    const statusCheck =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? project.is_active
        : !project.is_active;
    return statusCheck && (nameMatch || descMatch);
  });

  return (
    <div className="p-6 text-right">
      <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-6 text-center">
        רשימת פרויקטים
      </h2>

      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-2">
        <NavigationButton
          linkTo="/dashboard/add_project"
          label="הוספת פרויקט חדש"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-rubik border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
        >
          <option value="active">פרויקטים פעילים</option>
          <option value="inactive">פרויקטים לא פעילים</option>
          <option value="all">הכל</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="🔍 חיפוש לפי שם או תיאור..."
            className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition duration-150"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500"
            >
              ✖
            </button>
          )}
        </div>
      </div>

      <div className="overflow-auto rounded-lg shadow-lg bg-white/85">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="text-center bg-slate-100 text-gray-800">
              <th className="p-2 border">קוד פרויקט</th>
              <th className="p-2 border">שם פרויקט</th>
              <th className="p-2 border">תיאור</th>
              <th className="p-2 border">סטטוס</th>
              <th className="p-2 border">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center text-red-500 p-4">
                  אין פרויקטים להצגה
                </td>
              </tr>
            ) : (
              filteredProjects.map((project) => (
                <tr
                  key={project.project_id}
                  className={`transition duration-200 hover:bg-blue-50 ${
                    !project.is_active ? "bg-gray-100" : ""
                  }`}
                >
                  <td className="border p-2">{project.project_id}</td>
                  <td className="border p-2">{project.project_name}</td>
                  <td className="border p-2">
                    {project.project_description || "-"}
                  </td>
                  <td
                    className={`border p-2 font-semibold ${
                      project.is_active ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {project.is_active ? "פעיל" : "לא פעיל"}
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() =>
                        navigate(
                          `/dashboard/edit_project/${project.project_id}`
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      עריכה
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projects;
