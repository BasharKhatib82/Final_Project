import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FiUserCheck } from "react-icons/fi";
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
    <div className="navbar">
      <div className="navbar-links fontBtnMenu">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "active-link" : "inactive-link"
          }
        >
          דף ראשי
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "active-link" : "inactive-link"
          }
        >
          אודות
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "active-link" : "inactive-link"
          }
        >
          צור קשר
        </NavLink>
      </div>

      <Link to="/">
        <img className="logo" src={logo} alt="לוגו" />
      </Link>

      <div className="left-menu">
        {user && (
          <Link to="/dashboard" className="user-info">
            <FiUserCheck size={18} color="#ffffff" />
            <div>{user.full_name}</div>
          </Link>
        )}

        <div className="navbar-user-actions fontBtnMenu">
          {user ? (
            <button className="btn-logout fontBtnMenu" onClick={handleLogout}>
              התנתקות
            </button>
          ) : (
            <NavLink
              to="/userlogin"
              className={({ isActive }) =>
                isActive ? "active-link" : "inactive-link"
              }
            >
              התחברות
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
