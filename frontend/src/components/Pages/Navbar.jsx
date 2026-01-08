// frontend\src\components\Pages\Navbar.jsx

/**
 * רכיב: Navbar
 * -------------------------
 * רכיב המציג את תפריט הניווט העליון של המערכת.
 *
 * מטרת הרכיב:
 * - לאפשר ניווט מהיר בין דפי האתר: דף ראשי, אודות, צור קשר
 * - להציג את לוגו המערכת במרכז
 * - להציג את מצב המשתמש (מחובר / לא מחובר)
 *   - אם המשתמש מחובר → מוצג שמו המלא + קישור ללוח הבקרה וכפתור התנתקות
 *   -  אם המשתמש לא מחובר → מוצג כפתור התחברות
 *
 * קלט:
 * - user: אובייקט משתמש ( UserContextמגיע מ־ )
 * - logout: פונקציית התנתקות ( UserContextמ־ )
 *
 * פלט:
 * - תפריט ניווט עליון דינמי בהתאם למצב ההתחברות
 */

import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import logo from "../../assets/img/logo.png";
import { useUser } from "components/Tools";
import { AppButton } from "components/Buttons";

function Navbar() {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/95 shadow-xl px-6 py-3 flex justify-around items-center">
      {/* תפריט ניווט */}
      <div className="flex gap-4 items-center">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `font-rubik px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-green-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          דף ראשי
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `font-rubik px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-green-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          אודות
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            `font-rubik px-4 py-2 rounded-lg transition ${
              isActive
                ? "bg-green-600 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`
          }
        >
          צור קשר
        </NavLink>
      </div>

      {/* לוגו  */}
      <Link to="/">
        <img
          src={logo}
          alt="לוגו"
          className="h-12 w-auto  transition-transform duration-300 ease-in-out hover:scale-105"
        />
      </Link>

      {/* אזור משתמש */}
      <div className="flex gap-4 items-center">
        {user && (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
          >
            <Icon
              icon="mdi:user-check"
              width="1.7em"
              height="1.7em"
              color="white"
            />
            <span className="font-rubik">{user.full_name}</span>
          </Link>
        )}

        {user ? (
          // <button
          //   onClick={handleLogout}
          //   className="flex items-center gap-2 font-rubik text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
          // >
          //   <Icon
          //     icon="streamline-cyber:door-exit"
          //     width="1.5em"
          //     height="1.5em"
          //     color="white"
          //   />
          //   התנתקות
          // </button>
          <AppButton
            label="התנתקות"
            onClick={handleLogout}
            icon={
              <Icon
                icon="majesticons:door-exit-line"
                width="1.2em"
                height="1.2em"
              />
            }
            variant="danger"
          />
        ) : (
          // <NavLink
          //   to="/userlogin"
          //   className="flex items-center gap-2 font-rubik text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded transition"
          // >
          //   <Icon icon="ix:log-in" width="1.5em" height="1.5em" color="white" />{" "}
          //   התחברות
          // </NavLink>
          <AppButton
            label="התחברות"
            icon={<Icon icon="mdi:login" width="1.2em" height="1.2em" />}
            variant="navigate"
            to="/userlogin"
          />
        )}
      </div>
    </nav>
  );
}

export default Navbar;
