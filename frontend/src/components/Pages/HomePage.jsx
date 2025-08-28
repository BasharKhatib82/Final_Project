import React from "react";

function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-center font-rubik">
      <div className="bg-white/90 shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ברוכים הבאים למערכת ניהול פניות
        </h1>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          מערכת ידידותית ודינמית לניהול פניות, משימות, שעות נוכחות עובדים,
          והרשאות משתמשים – הכל במקום אחד.
        </p>

        <ul className="text-right text-gray-700 space-y-3 mb-8 list-disc pr-6 marker:text-blue-600">
          <li>ניהול פניות בצורה חכמה ומסודרת</li>
          <li>מעקב אחר שעות עבודה, חופשות והיעדרויות</li>
          <li>הקצאת משימות ודיווחי התקדמות</li>
          <li>ניהול קטגוריות והרשמות מתעניינים</li>
          <li>דוחות מתקדמים בהתאמה אישית</li>
          <li>מערכת הרשאות לפי תפקיד – מנהל כללי, מנהל שיווק, עובדי שיווק</li>
        </ul>

        <p className="text-xl text-blue-700 font-semibold">
          "יותר סדר, פחות בלגן – ניהול שמתחיל בחוויה"
        </p>
      </div>
    </div>
  );
}

export default HomePage;
