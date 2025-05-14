import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState([]);

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
    <div className="container">
      <div className="main">
        <h3 className="title">רשימת קורסים</h3>
        <div className="add-wrapper">
          <Link to="/dashboard/add_course" className="btn-add-dash">
            הוספת קורס חדש
          </Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>קוד קורס</th>
              <th>שם קורס</th>
              <th>פעולה</th>
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
