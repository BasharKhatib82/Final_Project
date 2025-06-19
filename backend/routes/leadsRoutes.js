import express from "express";
import dbSingleton from "../utils/dbSingleton.js";
import verifyToken from "../utils/verifyToken.js";
import logAction from "../utils/logAction.js";

const router = express.Router();
const connection = dbSingleton.getConnection();

// ✅ שליפת כל הפניות (כולל פרויקט, לקוח ונציג מטפל)
router.get("/", verifyToken, (req, res) => {
  const sql = `
    SELECT 
      l.*,
      c.first_name, 
      c.last_name, 
      c.email, 
      c.city, 
      p.project_name,
      u.first_name AS rep_first_name,
      u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    ORDER BY l.lead_id DESC
  `;
  connection.query(sql, (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    res.json({ Status: true, Result: result });
  });
});

// ✅ שליפת פנייה לפי ID
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      l.*, 
      c.first_name, c.last_name, c.email, c.city, 
      p.project_name,
      u.first_name AS rep_first_name,
      u.last_name AS rep_last_name
    FROM leads l
    JOIN clients c ON l.phone_number = c.phone_number
    JOIN projects p ON l.project_id = p.project_id
    LEFT JOIN users u ON l.user_id = u.user_id
    WHERE l.lead_id = ?
  `;
  connection.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    if (result.length === 0)
      return res.json({ Status: false, Error: "פנייה לא נמצאה" });
    res.json({ Status: true, Result: result[0] });
  });
});

// ✅ יצירת פנייה חדשה (כולל יצירת לקוח אם לא קיים)
router.post("/add", verifyToken, (req, res) => {
  const {
    phone_number,
    project_id,
    status,
    first_name,
    last_name,
    email,
    city,
  } = req.body;

  if (!phone_number || !project_id || !status) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות החובה" });
  }

  const checkClientSQL = `SELECT * FROM clients WHERE phone_number = ?`;

  connection.query(checkClientSQL, [phone_number], (err, clients) => {
    if (err) return res.json({ Status: false, Error: err });

    const proceedWithInsert = () => {
      const insertLeadSQL = `
        INSERT INTO leads (phone_number, project_id, status, user_id)
        VALUES (?, ?, ?, ?)
      `;
      connection.query(
        insertLeadSQL,
        [phone_number, project_id, status, req.user.user_id],
        (err) => {
          if (err) return res.json({ Status: false, Error: err });
          logAction("הוספת פנייה חדשה")(req, res, () => {});
          res.json({ Status: true, Message: "הפנייה נשמרה בהצלחה" });
        }
      );
    };

    if (clients.length === 0) {
      const insertClientSQL = `
        INSERT INTO clients (phone_number, first_name, last_name, email, city)
        VALUES (?, ?, ?, ?, ?)
      `;
      connection.query(
        insertClientSQL,
        [phone_number, first_name, last_name, email, city],
        (err) => {
          if (err) return res.json({ Status: false, Error: err });
          proceedWithInsert();
        }
      );
    } else {
      proceedWithInsert();
    }
  });
});

// ✅ עדכון פנייה כולל שינוי טלפון ופרטי לקוח
router.put("/edit/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const {
    phone_number,
    first_name,
    last_name,
    email,
    city,
    status,
    project_id,
  } = req.body;

  if (!phone_number || !first_name || !last_name || !status || !project_id) {
    return res.json({ Status: false, Error: "נא למלא את כל השדות הנדרשים" });
  }

  const checkClientSQL = `SELECT * FROM clients WHERE phone_number = ?`;

  connection.query(checkClientSQL, [phone_number], (err, clientResult) => {
    if (err) {
      console.error("שגיאה בבדיקת טלפון:", err);
      return res.json({ Status: false, Error: "שגיאה בבדיקת טלפון" });
    }

    const proceedToUpdate = () => {
      const updateLeadSQL = `
        UPDATE leads
        SET status = ?, project_id = ?, phone_number = ?
        WHERE lead_id = ?
      `;
      connection.query(
        updateLeadSQL,
        [status, project_id, phone_number, id],
        (err2) => {
          if (err2) {
            console.error("שגיאה בעדכון פנייה:", err2);
            return res.json({ Status: false, Error: "שגיאה בעדכון הפנייה" });
          }

          logAction(`עדכון פנייה #${id}`)(req, res, () => {});
          res.json({ Status: true, Message: "הפנייה עודכנה בהצלחה" });
        }
      );
    };

    if (clientResult.length > 0) {
      const updateClientSQL = `
        UPDATE clients
        SET first_name = ?, last_name = ?, email = ?, city = ?
        WHERE phone_number = ?
      `;
      connection.query(
        updateClientSQL,
        [first_name, last_name, email, city, phone_number],
        (err) => {
          if (err) {
            console.error("שגיאה בעדכון לקוח:", err);
            return res.json({ Status: false, Error: "שגיאה בעדכון לקוח" });
          }
          proceedToUpdate();
        }
      );
    } else {
      const insertClientSQL = `
        INSERT INTO clients (phone_number, first_name, last_name, email, city)
        VALUES (?, ?, ?, ?, ?)
      `;
      connection.query(
        insertClientSQL,
        [phone_number, first_name, last_name, email, city],
        (err) => {
          if (err) {
            console.error("שגיאה ביצירת לקוח חדש:", err);
            return res.json({ Status: false, Error: "שגיאה ביצירת לקוח" });
          }
          proceedToUpdate();
        }
      );
    }
  });
});

// ✅ עדכון נציג מטפל לפנייה
router.put("/update-rep/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  const sql = `
    UPDATE leads
    SET user_id = ?
    WHERE lead_id = ?
  `;

  connection.query(sql, [user_id || null, id], (err) => {
    if (err) {
      console.error("שגיאה בעדכון נציג:", err);
      return res.json({ Status: false, Error: "שגיאה בעדכון נציג" });
    }

    logAction(`עדכון נציג לפנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "נציג עודכן בהצלחה" });
  });
});

// ✅ שליפת לקוח לפי טלפון (לטופס AddLead)
router.get("/client/by-phone/:phone", verifyToken, (req, res) => {
  const { phone } = req.params;
  const sql = `SELECT * FROM clients WHERE phone_number = ?`;
  connection.query(sql, [phone], (err, result) => {
    if (err) return res.json({ Status: false, Error: err });
    if (result.length === 0)
      return res.json({ Status: false, Error: "לא נמצא לקוח" });
    res.json({ Status: true, Result: result[0] });
  });
});

// ✅ מחיקה לוגית של פנייה – שינוי סטטוס ל"בוטלה"
router.delete("/delete/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE leads
    SET status = 'בוטלה'
    WHERE lead_id = ?
  `;

  connection.query(sql, [id], (err) => {
    if (err) {
      console.error("שגיאה במחיקת פנייה:", err);
      return res.json({ Status: false, Error: "שגיאה במחיקה" });
    }

    logAction(`מחיקת פנייה (לוגית) #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "הפנייה סומנה כמבוטלת" });
  });
});

// ✅ עדכון סטטוס פנייה בלבד
router.put("/update-status/:id", verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `
    UPDATE leads
    SET status = ?
    WHERE lead_id = ?
  `;

  connection.query(sql, [status, id], (err) => {
    if (err) {
      console.error("שגיאה בעדכון סטטוס:", err);
      return res.json({ Status: false, Error: "שגיאה בעדכון סטטוס" });
    }

    logAction(`עדכון סטטוס לפנייה #${id}`)(req, res, () => {});
    res.json({ Status: true, Message: "סטטוס עודכן בהצלחה" });
  });
});

router.put("/bulk-assign", verifyToken, (req, res) => {
  const { leadIds, user_id } = req.body;

  if (!leadIds || leadIds.length === 0) {
    return res.json({ Status: false, Error: "לא נבחרו פניות" });
  }

  const sql = `
    UPDATE leads
    SET user_id = ?
    WHERE lead_id IN (?)
  `;

  connection.query(sql, [user_id || null, leadIds], (err) => {
    if (err) {
      console.error("שגיאה בשיוך פניות:", err);
      return res.json({ Status: false, Error: "שגיאה בשיוך פניות" });
    }

    logAction(`שיוך ${leadIds.length} פניות לנציג ${user_id}`)(
      req,
      res,
      () => {}
    );
    res.json({ Status: true, Message: "השיוך בוצע בהצלחה" });
  });
});

export default router;
