import { db } from "../utils/dbSingleton";

/**
 * Performs a daily check - if an employee has no attendance record at all for the current day,
 * an attendance record will be created with the status "היעדרות ללא שעות".
 */
const checkMissingAttendance = async () => {
  const today = new Date().toISOString().slice(0, 10); // Date in YYYY-MM-DD format

  try {
    // Step 1: Retrieve all active employees
    const getUsersQuery = `SELECT user_id FROM users WHERE is_active = 1`;
    const [users] = await db.query(getUsersQuery);

    // Step 2: Iterate over each employee to check for attendance
    for (const { user_id } of users) {
      const checkAttendanceQuery = `
        SELECT attendance_id FROM attendance
        WHERE user_id = ? AND date = ?
      `;

      const [results] = await db.query(checkAttendanceQuery, [user_id, today]);

      if (results.length === 0) {
        // ❗ No attendance record exists for this day – add a new record with the appropriate status
        const insertQuery = `
          INSERT INTO attendance (user_id, date, status)
          VALUES (?, ?, 'היעדרות')
        `;
        await db.query(insertQuery, [user_id, today]);
        console.log(`⏺️ Missing attendance recorded for user ${user_id}`);
      }
    }
  } catch (err) {
    console.error("❌ An error occurred during the attendance check:", err);
  }
};

export default checkMissingAttendance;
