// frontend/src/pages/Projects/Projects.jsx

/**
 * קומפוננטה: Projects
 * -------------------
 * 1. הצגת רשימת פרויקטים במערכת.
 * 2. אפשרויות:
 *    - חיפוש לפי שם / תיאור.
 *    - סינון לפי סטטוס (פעיל / לא פעיל / הכל).
 *    - הוספה, עריכה, מחיקה לוגית לפי הרשאות.
 *    -  (Excel / PDF) ייצוא + שליחה במייל.
 * 3. להצגת דוח ReportView שימוש ב .
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationButton } from "components/Buttons";
import { Popup, useUser } from "components/Tools";
import { api, extractApiError } from "utils";
import ReportView from "../Reports/ReportView";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [popup, setPopup] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data?.data || []);
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה בטעינת פרויקטים"),
        mode: "error",
        show: true,
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const res = await api.delete(`/projects/delete/${projectToDelete}`);
      if (res.data.success) {
        fetchProjects();
        setPopup({
          title: "הצלחה",
          message: res.data.message || "הפרויקט סומן כלא פעיל",
          mode: "success",
          show: true,
        });
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      setPopup({
        title: "שגיאה",
        message: extractApiError(err, "שגיאה במחיקת פרויקט"),
        mode: "error",
        show: true,
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  const columns = [
    {
      key: "project_id",
      label: "קוד פרויקט",
      export: (r) => r.project_id,
    },
    {
      key: "project_name",
      label: "שם פרויקט",
      export: (r) => r.project_name,
    },
    {
      key: "project_description",
      label: "תיאור",
      render: (r) => r.project_description || "-",
      export: (r) => r.project_description || "-",
    },
    {
      key: "active",
      label: "סטטוס",
      render: (r) =>
        r.active === 1 ? (
          <span className="text-green-600 font-semibold">פעיל</span>
        ) : (
          <span className="text-red-500 font-semibold">לא פעיל</span>
        ),
      export: (r) => (r.active === 1 ? "פעיל" : "לא פעיל"),
    },
  ];

  //  תנאי להצגת פעולות רק אם יש הרשאה
  if (
    user?.permission_edit_project === 1 ||
    user?.permission_delete_project === 1
  ) {
    columns.push({
      key: "actions",
      label: "פעולות",
      render: (r) => (
        <div className="flex justify-center gap-2">
          {user?.permission_edit_project === 1 && (
            <button
              onClick={() =>
                navigate(`/dashboard/edit_project/${r.project_id}`)
              }
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              עריכה
            </button>
          )}

          {user?.permission_delete_project === 1 && r.active === 1 && (
            <button
              onClick={() => setProjectToDelete(r.project_id)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              מחיקה
            </button>
          )}
        </div>
      ),
      export: () => null,
    });
  }

  const filtersDef = [
    {
      name: "active",
      label: "סטטוס",
      type: "select",
      options: [
        { value: "", label: "הצג הכל" },
        { value: "1", label: "פרויקטים פעילים" },
        { value: "0", label: "פרויקטים לא פעילים" },
      ],
    },
  ];

  return (
    <div className="flex flex-col flex-1 p-6 text-right">
      <ReportView
        title="רשימת פרויקטים"
        columns={columns}
        rows={projects}
        filtersDef={filtersDef}
        searchableKeys={["project_name", "project_description"]}
        pageSize={10}
        searchPlaceholder="חיפוש לפי שם או תיאור..."
        emailApiBase={api.defaults.baseURL}
        filtersVariant="inline"
        addButton={
          user?.permission_add_lead === 1 && (
            <NavigationButton
              label="הוספת פרויקט חדש"
              linkTo="/dashboard/add_project"
            />
          )
        }
      />

      {/* פופאפ מחיקה */}
      {projectToDelete && (
        <Popup
          title="אישור מחיקת פרויקט"
          message="האם אתה בטוח שברצונך למחוק את הפרויקט?"
          mode="confirm"
          onConfirm={handleDeleteProject}
          onClose={() => setProjectToDelete(null)}
        />
      )}

      {/* פופאפ כללי */}
      {popup?.show && (
        <Popup
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
