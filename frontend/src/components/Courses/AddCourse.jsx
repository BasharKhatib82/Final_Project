import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddCourse = () => {
  const [course, setCourse] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:3000/auth/add_course", { course })
      .then((result) => {
        if (result.data.Status) {
          navigate("/dashboard/courses");
        } else {
          alert(result.data.Error);
        }
      });
  };

  return (
    <div className="container">
      <div className="form-group">
        <h2>הוספת קורס חדש</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="course">
              <strong>שם קורס : </strong>
            </label>
            <input
              type="text"
              name="course"
              placeholder="הקלד שם קורס"
              onChange={(e) => setCourse(e.target.value)}
              className="form-add"
            />
          </div>

          <button className="btn-add">הוסף קורס</button>
        </form>
      </div>
    </div>
  );
};

export default AddCourse;
