import React from "react";

function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center font-alef">
      <div className="bg-white/90 shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">צור קשר</h1>

        <p className="text-lg text-gray-600 mb-6 leading-relaxed">
          נשמח לשמוע ממך! אם יש לך שאלה, הצעה או בקשה בנוגע למערכת – תוכל ליצור
          איתנו קשר באחת מהדרכים הבאות:
        </p>

        <ul className="text-right text-gray-700 space-y-4 mb-8 pr-6">
          <li>
            📧 <span className="font-semibold">דוא"ל:</span> tareq.nm1@gmail.com
          </li>
          <li>
            📧 <span className="font-semibold">דוא"ל:</span>{" "}
            Ba.khatib.82@gmail.com
          </li>
          <li>
            📞 <span className="font-semibold">טארק שלטף:</span> 054-5710021
          </li>
          <li>
            📞 <span className="font-semibold">בשאר ח'טיב:</span> 050-3000093
          </li>
        </ul>

        <p className="text-xl text-blue-700 font-semibold">
          "שירות, מקצועיות וניהול – הכל מתחיל בתקשורת טובה"
        </p>
      </div>
    </div>
  );
}

export default Contact;
