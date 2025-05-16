import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../Buttons/Button";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get("http://localhost:3000/auth/courses")
      .then((res) => {
        setCourses(res.data.Result);
        console.log(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <div className="main-dash mt2rem">
        <h2 className="text-center font-blue fontXL mp2rem">רשימת קורסים</h2>
        <div className="filters-container">
          <Button linkTo="/dashboard/add_course" label="הוספת קורס חדש" />

          <select
            className="status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="active">הצג קורסים פעילים בלבד</option>
            <option value="inactive">הצג קורסים לא פעילים בלבד</option>
            <option value="all">הצג את כל קורסים</option>
          </select>

          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="🔍  חיפוש קורס לפי שם ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="נקה חיפוש"
              >
                ❌
              </button>
            )}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th className="col10per">קוד קורס</th>
              <th className="col10per">שם קורס</th>

              <th className="col10per">פעולה</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.course_id}</td>
                <td>{course.course_name}</td>
                <td className="action-buttons">
                  <button className="btn-edit">עריכה</button>
                  <button className="btn-delete">מחיקה</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Courses;
