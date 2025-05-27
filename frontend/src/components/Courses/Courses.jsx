import axios from "axios";
import React, { useEffect, useState } from "react";

import Button from "../Buttons/Button";

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
    <div className="main-dash mt2rem">
      <h2 className="text-center font-blue fontXL mp2rem">רשימת קורסים</h2>

      <div className="filters-container">
        <Button linkTo="/dashboard/add_course" label="הוספת קורס חדש" />
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
  );
};

export default Courses;
