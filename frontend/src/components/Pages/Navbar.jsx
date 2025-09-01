import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FiUserCheck } from "react-icons/fi";
import { Icon } from "@iconify/react";
import logo from "../../assets/img/logo.png";
import { useUser } from "../../components/Tools/UserContext";

function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/userlogin");
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

      {/* לוגו */}
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
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            <FiUserCheck size={20} />
            <span className="font-rubik">{user.full_name}</span>
          </Link>
        )}

        {user ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-rubik text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
          >
            התנתקות
            <Icon
              icon="streamline-cyber-color:door-exit"
              width="1.7em"
              height="1.7em"
            />
          </button>
        ) : (
          <NavLink
            to="/userlogin"
            className="font-rubik text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            התחברות
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
