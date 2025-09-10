// frontend/src/pages/Projects/Projects.jsx

/**
 * קומפוננטה: Projects
 * -------------------
 * 1. הצגת כל הפרויקטים הקיימים במערכת.
 * 2. אפשרויות:
 *    - חיפוש וסינון לפי סטטוס (פעיל / לא פעיל / הכל).
 *    - הוספת פרויקט חדש.
 *    - עריכת פרויקט קיים.
 *    - סימון פרויקט כלא פעיל (מחיקה לוגית).
 *    - (Excel / PDF / שליחה למייל) ייצוא דוחות .
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { ReportProvider } from "../Reports/ReportContext";
import ReportExport from "../Reports/ReportExport";
import ReportEmail from "../Reports/ReportEmail";
import { api, extractApiError } from "utils";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [popupData, setPopupData] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    api
      .get("/projects")
      .then((res) => {
        if (res.data.success) {
          setProjects(res.data.data || []);
        }
      })
      .catch((err) => {
        setPopupData({
          title: "שגיאה",
          message: extractApiError(err, "שגיאה בטעינת פרויקטים"),
          mode: "error",
        });
      });
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const res = await api.delete(`/projects/delete/${projectToDelete}`);

      if (res.data.success) {
        fetchProjects();
        setPopupData({
          title: "הצלחה",
          message: res.data.message || "הפרויקט סומן כלא פעיל",
          mode: "success",
        });
      } else {
        setPopupData({
          title: "שגיאה",
          message: res.data.message || "שגיאה במחיקת פרויקט",
          mode: "error",
        });
      }
    } catch (err) {
      setPopupData({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה במחיקת פרויקט"),
        mode: "error",
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = project.project_name.toLowerCase().includes(term);
    const descMatch = project.project_description?.toLowerCase().includes(term);
    const statusCheck =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? project.active === 1
        : project.active === 0;
    return statusCheck && (nameMatch || descMatch);
  });

  const columns = [
    { key: "project_id", label: "קוד פרויקט", export: (r) => r.project_id },
    { key: "project_name", label: "שם פרויקט", export: (r) => r.project_name },
    {
      key: "project_description",
      label: "תיאור",
      export: (r) => r.project_description || "-",
    },
    {
      key: "active",
      label: "סטטוס",
      export: (r) => (r.active === 1 ? "פעיל" : "לא פעיל"),
    },
  ];

  return (
    <div className="p-4 text-right">
      <header className="flex items-center justify-center py-0 my-0">
        <h2 className="font-rubik text-2xl font-semibold text-blue-700 mb-2 text-center">
          רשימת פרויקטים
        </h2>
      </header>

      {/*  כפתור הוספה פרויקט */}
      {user?.permission_add_lead === 1 && (
        <div className="flex justify-start mb-2">
          <NavigationButton
            linkTo="/dashboard/add_project"
            label="הוספת פרויקט חדש"
          />
        </div>
      )}
      {/* סרגל סינון תפקידים  */}
      <div className="rounded-lg bg-white/85 p-2 flex flex-wrap items-center gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="font-rubik border border-gray-300 rounded px-3 py-1 text-sm"
        >
          <option value="active">פרויקטים פעילים</option>
          <option value="inactive">פרויקטים לא פעילים</option>
          <option value="all">הצג הכל</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder="חיפוש לפי שם פרויקט..."
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-500 text-lg"
            >
              ✖
            </button>
          )}
        </div>

        {/* ייצוא ודוחות */}
        <ReportProvider
          title="רשימת פרויקטים"
          columns={columns}
          rows={filteredProjects}
        >
          <ReportExport />
          <ReportEmail />
        </ReportProvider>
      </div>

      {/* טבלה */}
      <div className="overflow-auto rounded-lg shadow-lg bg-white/85">
        <table className="w-full table-auto border-collapse text-sm text-center">
          <thead>
            <tr className="bg-slate-100 text-gray-800">
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
                  className={`hover:bg-blue-50 transition ${
                    project.active === 0 ? "bg-gray-100" : ""
                  }`}
                >
                  <td className="border p-2">{project.project_id}</td>
                  <td className="border p-2">{project.project_name}</td>
                  <td className="border p-2">
                    {project.project_description || "-"}
                  </td>
                  <td
                    className={`border p-2 font-semibold ${
                      project.active === 1 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {project.active === 1 ? "פעיל" : "לא פעיל"}
                  </td>
                  <td className="border p-2 flex justify-center gap-2">
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
                    {project.active === 1 && (
                      <button
                        onClick={() => setProjectToDelete(project.project_id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        מחיקה
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* פופאפ מחיקה */}
      {projectToDelete && (
        <Popup
          title="אישור מחיקת פרויקט"
          message="האם אתה בטוח שברצונך למחוק את הפרויקט ?"
          mode="confirm"
          onConfirm={handleDeleteProject}
          onClose={() => setProjectToDelete(null)}
        />
      )}

      {/* פופאפ כללי */}
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

export default Projects;
