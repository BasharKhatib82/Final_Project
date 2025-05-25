import React from "react";

function HomePage() {
  return (
    <div className="container">
      <div className="main">
        <div className="content h90pers df-fdc-jcsa">
          <h1>ברוכים הבאים למערכת ניהול פניות</h1>
          <p className="description">
            מערכת ידידותית ודינמית לניהול פניות , משימות, שעות נוכחות עובדים,
            והרשאות משתמשים – הכל במקום אחד.
          </p>
          <ul className="features-list">
            <li>&nbsp; ניהול פניות בצורה חכמה ומסודרת</li>
            <li>&nbsp;מעקב אחר שעות עבודה, חופשות והיעדרויות</li>
            <li>&nbsp;הקצאת משימות ודיווחי התקדמות</li>
            <li>&nbsp; ניהול קטגוריות והרשמות מתעניינים</li>
            <li>&nbsp;דוחות מתקדמים בהתאמה אישית</li>
            <li>
              &nbsp;מערכת הרשאות לפי תפקיד&nbsp;(&nbsp;מנהל כללי, מנהל שיווק,
              עובדי שיווק &nbsp;)
            </li>
          </ul>
          <p className="slogan">"יותר סדר, פחות בלגן – ניהול שמתחיל בחוויה"</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
