import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/Tools/UserContext";
import Popup from "../../components/Tools/Popup";

const api = process.env.REACT_APP_API_URL;

function Login() {
  const [values, setValues] = useState({ user_id: "", password: "" });
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.user_id || !values.password) {
      setError(" כל השדות חוב");
      return;
    }

    try {
      const loginRes = await axios.post(`${api}/auth/login`, values, {
        withCredentials: true,
      });

      if (loginRes.data.success) {
        const authRes = await axios.get(`${api}/auth/check`, {
          withCredentials: true,
        });
        const userData = loginRes.data.user;
        // מוסיפים full_name
        userData.full_name = `${userData.first_name} ${userData.last_name}`;
        if (authRes.data.loggedIn) {
          // כאן שמים את כל פרטי המשתמש — כולל ההרשאות
          setUser(loginRes.data.user);

          // ✅ מציגים פופאפ הצלחה
          setShowPopup(true);
        } else {
          setError("שגיאה באימות ההתחברות");
        }
      } else {
        setError(loginRes.data.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("שם המשתמש או הסיסמה אינם נכונים");
    }
  };

  return (
    <div className="flex justify-center items-center font-rubik pt-[10%]">
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          התחברות למערכת
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-right ">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium mb-1">
              תעודת זהות:
            </label>
            <input
              type="text"
              inputMode="numeric"
              name="user_id"
              id="user_id"
              placeholder="הקלד תעודת זהות"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              maxLength={9}
              value={values.user_id}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setValues({ ...values, user_id: onlyDigits });
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              סיסמה:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="הקלד סיסמה"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            התחברות
          </button>
        </form>
      </div>
      {showPopup && (
        <Popup
          title="חשבון זוהה בהצלחה ✅"
          message="נעביר אותך לאזור האישי..."
          mode="success"
          autoClose={2000} // יעלם אחרי 2 שניות
          redirectOnClose="/dashboard" // לאחר הסגירה או היעלמות
          onClose={() => setShowPopup(false)} // לסגור את הפופאפ ידנית אם צריך
        />
      )}
    </div>
  );
}

export default Login;
