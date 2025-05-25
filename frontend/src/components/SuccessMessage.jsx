import React from "react";
import { Link } from "react-router-dom";

const SuccessMessage = () => {
  return (
    <div className="container">
      <div className="success-message">
        <h2>🎉 העובד נוסף בהצלחה!</h2>
        <p>תוכל לעבור לרשימת העובדים או להוסיף עובד נוסף.</p>
        <div className="success-actions">
          <Link to="/dashboard/users" className="btn-back">
            לרשימת העובדים
          </Link>
          <Link to="/dashboard/add_user" className="btn-add">
            הוספת עובד נוסף
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;
