import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import axios from "axios";

const { Client } = pkg;

// ✅ הגדרות Puppeteer שימנעו בעיות בלינוקס VPS
const client = new Client({
  puppeteer: {
    headless: true, // רץ בלי לפתוח חלון
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

let userStates = {}; // מצב שיחה לכל משתמש

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("✅ WhatsApp client is ready!"));

// ---- FLOW ----
client.on("message", async (msg) => {
  const from = msg.from;
  const text = msg.body.trim();

  if (!userStates[from]) {
    userStates[from] = { step: 1, data: {} };
    return msg.reply("שלום 👋 מה השם הפרטי שלך?");
  }

  const state = userStates[from];

  switch (state.step) {
    case 1:
      state.data.first_name = text;
      state.step++;
      return msg.reply("מעולה ✅ מה שם המשפחה?");
    case 2:
      state.data.last_name = text;
      state.step++;
      return msg.reply("יופי 👍 מה מספר הטלפון שלך?");
    case 3:
      state.data.phone_number = text;
      state.step++;
      return msg.reply("מעולה! 📧 מה כתובת המייל שלך?");
    case 4:
      state.data.email = text;
      state.step++;
      return msg.reply("מצוין 🏙️ מה שם העיר שלך?");
    case 5:
      state.data.city = text;
      state.step++;

      // ✅ שליפת פרויקטים פעילים מהשרת
      try {
        const resProjects = await axios.get(
          "https://api.respondify-crm.co.il/projects/active"
        );
        if (
          !resProjects.data.Status ||
          resProjects.data.projects.length === 0
        ) {
          msg.reply("❌ אין כרגע פרויקטים פעילים במערכת 🙏");
          delete userStates[from];
          return;
        }

        state.projects = resProjects.data.projects;

        let message = "📌 בחר את הפרויקט שמעניין אותך:\n";
        state.projects.forEach((p, i) => {
          message += `${i + 1}. ${p.project_name}\n`;
        });

        msg.reply(message);
      } catch (err) {
        console.error("❌ שגיאה בשליפת פרויקטים:", err.message);
        msg.reply("⚠️ לא הצלחתי לשלוף את רשימת הפרויקטים 🙏");
        delete userStates[from];
      }
      break;

    case 6: {
      const choice = parseInt(text);
      if (!isNaN(choice) && state.projects && state.projects[choice - 1]) {
        const selectedProject = state.projects[choice - 1];
        state.data.project_id = selectedProject.project_id;

        try {
          const response = await axios.post(
            "https://api.respondify-crm.co.il/leads/add-from-bot",
            {
              phone_number: state.data.phone_number,
              project_id: state.data.project_id,
              first_name: state.data.first_name,
              last_name: state.data.last_name,
              email: state.data.email,
              city: state.data.city,
            },
            {
              headers: {
                "x-bot-secret": process.env.BOT_SECRET, // נשלח את ה-Secret לשרת
              },
            }
          );

          if (response.data.Status) {
            msg.reply(
              `✅ תודה ${state.data.first_name}! הפנייה שלך לפרויקט "${selectedProject.project_name}" נקלטה בהצלחה 🚀`
            );
          } else {
            msg.reply(`⚠️ לא ניתן לשמור את הפנייה: ${response.data.Error}`);
          }
        } catch (err) {
          console.error(
            "❌ שגיאה בקריאת API:",
            err.response?.data || err.message
          );
          msg.reply("אירעה שגיאה בעת שליחת הפנייה לשרת 🙏");
        }

        delete userStates[from]; // איפוס מצב
      } else {
        msg.reply("❌ בחירה לא תקינה, נסה שוב להקליד מספר מתוך הרשימה.");
      }
      break;
    }
  }
});

client.initialize();
