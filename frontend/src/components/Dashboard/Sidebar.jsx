import React, { useState } from "react";
import { Link } from "react-router-dom";
import Tooltip from "../Tools/Tooltip";
import { useUser } from "../../components/Tools/UserContext";
import { IoCloseSharp } from "react-icons/io5";
import { Icon } from "@iconify/react";
import {
  FaUsers,
  FaClock,
  FaPhone,
  FaBook,
  FaTasks,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  const getNavItems = () => {
    if (!user) return [];

    return [
      user.dashboard_access === 1 && {
        label: "לוח בקרה",
        to: "/dashboard",
        icon: <Icon icon="fluent-color:home-48" width="2em" height="2em" />,
      },

      user.roles_page_access === 1 && {
        label: "ניהול תפקידים",
        to: "/dashboard/roles",
        icon: ,
      },

      user.users_page_access === 1 && {
        label: "ניהול עובדים",
        to: "/dashboard/users",
        icon: <FaUsers />,
      },
      user.reports_page_access === 1 && {
        label: "ניהול דוחות",
        to: "/dashboard/reports",
        icon: <FaClock />,
      },
      user.attendance_page_access === 1 && {
        label: "ניהול שעות עבודה",
        to: "/dashboard/attendance",
        icon: <FaClock />,
      },

      user.leads_page_access === 1 && {
        label: "ניהול פניות",
        to: "/dashboard/leads",
        icon: <FaPhone />,
      },
      user.projects_page_access === 1 && {
        label: "ניהול פרויקטים",
        to: "/dashboard/projects",
        icon: <FaBook />,
      },

      user.tasks_page_access === 1 && {
        label: "ניהול משימות",
        to: "/dashboard/tasks",
        icon: <FaTasks />,
      },

      user.logs_page_access === 1 && {
        label: "לוג פעילות",
        to: "/dashboard/logs",
        icon: <FaHistory />,
      },

      { label: "הגדרות חשבון", to: "/dashboard/profile", icon: <FaCog /> },

      {
        label: "יציאה",
        to: "/userlogin",
        icon: <FaSignOutAlt />,
        onClick: handleLogout,
      },
    ].filter(Boolean);
  };

  const navItems = getNavItems();

  return (
    <div
      className={`bg-gray-800 text-white transition-all duration-300
        ${isCollapsed ? "w-16" : "w-60"} 
        ${isOpen ? "block" : "hidden md:block"}
      `}
    >
      {/* כותרת וכפתורי שליטה */}
      <div className="flex justify-between items-center p-4 ">
        <h2
          className={`font-rubik text-xl font-medium transition-all duration-200  ${
            isCollapsed ? "hidden" : "block"
          }`}
        >
          לוח בקרה
        </h2>

        {/* כפתור כיווץ/פתיחה בדסקטופ */}
        <button
          className="hidden md:block text-white hover:bg-gray-700 p-2 rounded"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "פתח תפריט" : "כווץ תפריט"}
        >
          {isCollapsed ? <FaAngleDoubleLeft /> : <FaAngleDoubleRight />}
        </button>

        {/* כפתור ☰ למובייל */}
        <button
          className="block md:hidden text-white "
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IoCloseSharp size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* תפריט */}
      <nav className="mt-4 ">
        <ul className="space-y-1 ">
          {navItems.map(({ label, to, icon, onClick }, index) => (
            <li key={index} className="p-2 cursor-pointer">
              <Link
                to={to}
                onClick={onClick}
                className="relative flex items-center justify-center md:justify-start gap-3 p-2 rounded-md group transition-all duration-200 "
              >
                {/* אייקון */}
                {isCollapsed ? (
                  <Tooltip message={label}>
                    <span className="text-lg">{icon}</span>
                  </Tooltip>
                ) : (
                  <>
                    <span className="text-lg ">{icon}</span>
                    <span className="text-sm  z-50">{label}</span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
