import React from "react";

function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center font-rubik">
      <div className="bg-white/90 shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">אודות המערכת</h1>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed text-right">
          מערכת ניהול הלידים פותחה במסגרת פרויקט סיום של טארק שלטף ובשאר ח'טיב.
          המערכת נועדה לתת מענה שלם ומודרני לצרכים של מוסדות חינוך, מכללות,
          וחברות המעוניינות לנהל פניות, עובדים, שעות נוכחות, משימות ועוד – בצורה
          קלה ומרוכזת.
        </p>

        <ul className="text-right text-gray-700 space-y-3 mb-8 list-disc pr-6 marker:text-blue-600">
          <li>פותחה בטכנולוגיות מתקדמות (React, Node.js, SQL)</li>
          <li>כוללת הרשאות מותאמות לפי תפקיד</li>
          <li>עיצוב רספונסיבי ונגיש למשתמש</li>
          <li>התממשקות ל-API חיצוניים ומערכות צד שלישי</li>
          <li>בנויה בקוד פתוח וניתנת להרחבה בקלות</li>
        </ul>

        <p className="text-xl text-blue-700 font-semibold">
          "המטרה שלנו – להפוך את תהליך הניהול לפשוט, מהיר וחכם"
        </p>
      </div>
    </div>
  );
}

export default About;
