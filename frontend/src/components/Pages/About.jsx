import React from "react";

function About() {
  return (
    <div className="container h100">
      <div className="main">
        <div className="content h90pers df-fdc-jcsa">
          <h1>אודות המערכת</h1>
          <p className="description">
            מערכת ניהול הלידים פותחה במסגרת פרויקט סיום של טארק שלטף ובשאר
            ח'טיב. המערכת נועדה לתת מענה שלם ומודרני לצרכים של מוסדות חינוך,
            מכללות, וחברות המעוניינות לנהל פניות, עובדים, שעות נוכחות, משימות
            ועוד – בצורה קלה ומרוכזת.
          </p>
          <ul className="features-list">
            <li>&nbsp; פותחה בטכנולוגיות מתקדמות (React, Node.js, SQL)</li>
            <li>&nbsp; כוללת הרשאות מותאמות לפי תפקיד</li>
            <li>&nbsp; עיצוב רספונסיבי ונגיש למשתמש</li>
            <li>&nbsp; התממשקות ל-API חיצוניים ומערכות צד שליש</li>
            <li>&nbsp; בנויה בקוד פתוח וניתנת להרחבה בקלות</li>
          </ul>

          <p className="slogan">
            "המטרה שלנו – להפוך את תהליך הניהול לפשוט, מהיר וחכם"
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
