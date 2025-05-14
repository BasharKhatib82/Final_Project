import React from "react";

function Contact() {
  return (
    <div className="container">
      <div className="main">
        <div className="content h90pers df-fdc-jcsa">
          <h1>צור קשר</h1>

          <p className="description">
            נשמח לשמוע ממך! אם יש לך שאלה, הצעה או בקשה בנוגע למערכת – תוכל
            ליצור איתנו קשר באחת מהדרכים הבאות :
          </p>

          <ul className="features-list">
            <li>
              &nbsp; 📧&nbsp;&nbsp; דוא"ל&nbsp;:&nbsp; tareq.nm1@gmail.com
            </li>
            <li>
              &nbsp; 📧&nbsp;&nbsp; דוא"ל&nbsp;:&nbsp; Ba.khatib.82@gmail.com
            </li>
            <li>&nbsp;📞&nbsp;&nbsp; טארק שלטף&nbsp;: 054-5710021</li>
            <li>&nbsp;📞&nbsp;&nbsp; בשאר ח'טיב&nbsp;: 050-3000093</li>
          </ul>

          <p className="slogan">
            "שירות, מקצועיות וניהול – הכל מתחיל בתקשורת טובה"
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
