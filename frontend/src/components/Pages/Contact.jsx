// frontend\src\components\Pages\Contact.jsx

/**
 * רכיב: Contact
 * -------------------------
 * רכיב המציג עמוד "צור קשר" עם טופס לשליחת פנייה.
 *
 * מטרת הרכיב:
 * - לאפשר למשתמש להזין פרטי התקשרות והודעה
 * - לשלוח את המידע לשרת באמצעות בקשת POST
 * - להציג חיווי למשתמש (הצלחה / שגיאה) באמצעות חלון קופץ
 *
 * קלט: אין (פנימי של הטופס state הרכיב שומר  )
 * פלט: טופס מלא + הודעת הצלחה/שגיאה לאחר שליחה
 *
 * זרימת עבודה:
 * - המשתמש ממלא שם, אימייל, טלפון, נושא והודעה
 * - בעת שליחה → נשלחת בקשה לשרת
 * - אם הצליח → מציג הודעת הצלחה ומנקה את הטופס
 * - אם נכשל → מציג הודעת שגיאה
 */

import React, { useState } from "react";
import axios from "axios";
import { AppButton } from "components/Buttons";
import { Icon } from "@iconify/react";
import { Popup } from "components/Tools";

const api = process.env.REACT_APP_API_URL;

function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "התעניינות במערכת",
    message: "",
  });

  const [popup, setPopup] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${api}/contact`, formData, { withCredentials: true });

      setPopup({
        icon: (
          <Icon
            icon="streamline:send-email-remix"
            width="1.5em"
            height="1.5em"
            color="green"
          />
        ),
        title: "הצלחה",
        message: "הפנייה נשלחה בהצלחה",
        mode: "success",
      });

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        subject: "התעניינות במערכת",
        message: "",
      });
    } catch (err) {
      setPopup({
        icon: (
          <Icon
            icon="icon-park-outline:error"
            width="1.5em"
            height="1.5em"
            color="red"
          />
        ),
        title: "שגיאה",
        message: "לא הצלחנו לשלוח את הפנייה. נסה שוב.",
        mode: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-right font-rubik">
      <div className="bg-white/90 shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-5 text-center">
          צור קשר
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">שם מלא:</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">אימייל:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">טלפון:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-1.5"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">נושא:</label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-1.5"
            >
              <option>התעניינות במערכת</option>
              <option>תמיכה טכנית</option>
              <option>שירות לקוחות</option>
              <option>פניות הציבור</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">הודעה:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            ></textarea>
          </div>
          <div className="flex justify-around pt-2">
            <AppButton
              label={loading ? "שולח..." : "שליחת פנייה"}
              type="submit"
              disabled={loading}
              icon={
                <Icon
                  icon="streamline:send-email-remix"
                  width="1.2em"
                  height="1.2em"
                />
              }
              className="w-full"
              variant="normal"
            />
          </div>
        </form>
      </div>

      {/* פופאפ */}
      {popup && (
        <Popup
          icon={popup.icon}
          title={popup.title}
          message={popup.message}
          mode={popup.mode}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

export default Contact;
