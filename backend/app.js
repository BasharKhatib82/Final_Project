const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { usersRouter } = require("./Routes/UsersRoute");

const app = express();
const port = process.env.PORT || 8801;

//-----------------------------------------------------------------------//
// ✳️ לתקשר עם השרת React מאפשרת ל CORS קונפיגורציית
app.use(
  cors({
    origin: "http://localhost:3000", // Frontend כתובת ה
    methods: ["GET", "POST", "PUT"], //  סוגי הבקשות המותרים
    credentials: true, //  (סשן) cookies מאפשר שליחה של
  })
);

//-----------------------------------------------------------------------//
// ✳️ לניהול סשן בצד השרת express-session הגדרת
app.use(
  session({
    secret: "secret_key", // מחרוזת להצפנת מידע הסשן
    resave: false, // לא לשמור את הסשן אם לא היה שינוי
    saveUninitialized: true, // לשמור סשן חדש גם אם הוא ריק
    cookie: {
      maxAge: 1000 * 60 * 60, // זמן חיים של הסשן: שעה אחת
      secure: false, // false = רגיל (לוקאלי) http מאפשר עבודה ב
    },
  })
);

//-----------------------------------------------------------------------//
// ✳️  axios עם POST למשל בקושת Client מה JSON תומך בקבלת נתונים בפורמט
app.use(express.json());

//-----------------------------------------------------------------------//
// ✳️ חיבור כל נתיב שמתחיל ב-"/" לראוטר הראשי שלך
app.use("/", usersRouter);

//-----------------------------------------------------------------------//
// ✳️ הפעלת השרת
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
