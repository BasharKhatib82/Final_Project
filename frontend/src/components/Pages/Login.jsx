import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../components/Tools/UserContext";
import Popup from "../../components/Tools/Popup";
import { FcApproval } from "react-icons/fc";

const api = process.env.REACT_APP_API_URL;

function Login() {
  const [values, setValues] = useState({ user_id: "", password: "" });
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showPwd, setShowPwd] = useState(false);
  const [mustChange, setMustChange] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!values.user_id || !values.password) {
      setError(" כל השדות חובה");
      return;
    }

    try {
      const loginRes = await axios.post(`${api}/auth/login`, values, {
        withCredentials: true,
      });

      if (loginRes.data.mustChangePassword) {
        setError(null);
        setMustChange(true); // מפעיל מסך שינוי סיסמה
        return;
      }

      if (loginRes.data.success) {
        const authRes = await axios.get(`${api}/auth/check`, {
          withCredentials: true,
        });
        const userData = loginRes.data.user;
        userData.full_name = `${userData.first_name} ${userData.last_name}`;

        if (authRes.data.loggedIn) {
          setUser(loginRes.data.user);
          setShowPopup(true); // ✅ מציג פופאפ הצלחה
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
      {!mustChange && (
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
              <label
                htmlFor="user_id"
                className="block text-sm font-medium mb-1"
              >
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

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                סיסמה:
              </label>

              <input
                type={showPwd ? "text" : "password"}
                name="password"
                id="password"
                placeholder="הקלד סיסמה"
                autoComplete="current-password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 pl-10"
                onChange={(e) =>
                  setValues({ ...values, password: e.target.value })
                }
              />

              {/* כפתור עין */}
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "הסתר סיסמה" : "הצג סיסמה"}
                title={showPwd ? "הסתר סיסמה" : "הצג סיסמה"}
                className="absolute inset-y-[30px] left-2 grid place-items-center h-8 w-8 rounded hover:bg-gray-100 focus:outline-none"
              >
                {showPwd ? (
                  // Eye-off (slash)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.84-3.79" />
                    <path d="M9.88 5.09A10 10 0 0 1 12 5c7 0 11 7 11 7a13 13 0 0 1-3.07 4.21" />
                    <path d="M6.61 6.61A13 13 0 0 0 2 12s4 7 10 7c1.3 0 2.54-.23 3.68-.65" />
                  </svg>
                ) : (
                  // Eye
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-5 h-5"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
            >
              התחברות
            </button>
          </form>

          {/* 🔗 כפתור שכחת סיסמה */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-600 hover:underline"
            >
              שכחת סיסמה?
            </button>
          </div>
        </div>
      )}

      {/* מסך שינוי סיסמה מאולץ */}
      {mustChange && (
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-md w-full max-w-md">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">
            נדרש שינוי סיסמה
          </h3>
          <p className="text-sm text-gray-600 mb-4 text-center">
            <span>עברו 90 יום מאז שינוי הסיסמה האחרון</span>
            <br />
            <span>יש להגדיר סיסמה חדשה כדי להמשיך</span>
          </p>

          <input
            type="password"
            placeholder="סיסמה נוכחית"
            className="w-full border px-3 py-2 rounded mb-3"
            value={pwdForm.current}
            onChange={(e) =>
              setPwdForm({ ...pwdForm, current: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="סיסמה חדשה"
            className="w-full border px-3 py-2 rounded mb-3"
            value={pwdForm.next}
            onChange={(e) => setPwdForm({ ...pwdForm, next: e.target.value })}
          />

          <input
            type="password"
            placeholder="אישור סיסמה חדשה"
            className="w-full border px-3 py-2 rounded mb-3"
            value={pwdForm.confirm}
            onChange={(e) =>
              setPwdForm({ ...pwdForm, confirm: e.target.value })
            }
          />

          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
            onClick={async () => {
              if (!pwdForm.current || !pwdForm.next || !pwdForm.confirm) {
                setError("יש למלא את כל השדות");
                return;
              }
              if (pwdForm.next !== pwdForm.confirm) {
                setError("הסיסמאות אינן תואמות");
                return;
              }
              try {
                const resp = await axios.put(
                  `${api}/auth/change-password/${values.user_id}`,
                  {
                    currentPassword: pwdForm.current,
                    newPassword: pwdForm.next,
                  },
                  { withCredentials: true }
                );

                if (resp.data.success) {
                  setMustChange("done");
                  setShowPopup(true);
                } else {
                  setError(resp.data.message);
                }
              } catch (err) {
                setError("שגיאה בשינוי הסיסמה");
              }
            }}
          >
            שמור סיסמה חדשה
          </button>
        </div>
      )}

      {/* פופאפ התחברות רגילה */}
      {showPopup && mustChange === false && (
        <Popup
          icon={<FcApproval className="text-5xl" />}
          title="חשבונך זוהה בהצלחה"
          message="כעת נעביר אותך לאזור האישי שלך"
          mode="successMessage"
          autoClose={2000}
          redirectOnClose="/dashboard"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* פופאפ שינוי סיסמה מאולץ */}
      {showPopup && mustChange === "done" && (
        <Popup
          icon={<FcApproval className="text-5xl" />}
          title="הסיסמה הוחלפה בהצלחה"
          message="כעת ניתן להתחבר מחדש עם הסיסמה החדשה"
          mode="successMessage"
          autoClose={2500}
          redirectOnClose="/login"
          onClose={() => {
            setShowPopup(false);
            navigate("/login");
          }}
        />
      )}
    </div>
  );
}

export default Login;
