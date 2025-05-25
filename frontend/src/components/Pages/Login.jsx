import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/Tools/UserContext";

function Login() {
  const [values, setValues] = useState({ user_id: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useUser(); // שימוש בקונטקסט

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.user_id || !values.password) {
      setError("נא למלא את כל השדות");
      return;
    }

    try {
      const loginRes = await axios.post(
        "http://localhost:8801/auth/login",
        values,
        {
          withCredentials: true,
        }
      );

      if (loginRes.data.success) {
        // שליפת מידע מהשרת והכנסת המשתמש לקונטקסט
        const authRes = await axios.get("http://localhost:8801/auth/check", {
          withCredentials: true,
        });

        if (authRes.data.loggedIn) {
          setUser(authRes.data.user);
          navigate("/dashboard");
        }
      } else {
        setError(loginRes.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("אירעה שגיאה בשרת");
    }
  };

  return (
    <div className="container">
      <div className="main">
        <div className="login">
          <h2 className="fontL text-center mp2rem">התחברות למערכת</h2>
          <div className="massage-err">{error && error}</div>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="user_id" className="label-login">
                <strong>תעודת זהות : </strong>
              </label>
              <input
                type="number"
                name="user_id"
                autoComplete="off"
                placeholder="הקלד תעודת זהות"
                onChange={(e) =>
                  setValues({ ...values, user_id: e.target.value })
                }
                className="form-login"
              />
            </div>
            <div>
              <label htmlFor="password" className="label-login">
                <strong>סיסמה : </strong>
              </label>
              <input
                type="password"
                name="password"
                placeholder="הקלד סיסמה"
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
                className="form-login"
              />
            </div>
            <button type="submit" className="btn-login">
              התחברות
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
