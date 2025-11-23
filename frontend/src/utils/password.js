// utils/password.js

/** בודק: 8+ תווים, רק אותיות/מספרים, לפחות ספרה אחת ולפחות אות אחת */
export function isValidPass(pwd) {
  if (typeof pwd !== "string") return false;
  return (
    pwd.length >= 8 &&
    /^[A-Za-z0-9]+$/.test(pwd) && // רק אותיות ומספרים
    /[A-Za-z]/.test(pwd) && // לפחות אות אחת
    /\d/.test(pwd) // לפחות ספרה אחת
  );
}

/** מחזיר שגיאות קריאות  */
export function getPasswordErrors(pwd = "") {
  const errors = [];
  if (pwd.length < 8) errors.push("הסיסמה חייבת להיות באורך 8 תווים לפחות");
  if (!/^[A-Za-z0-9]+$/.test(pwd))
    errors.push("מותרות רק אותיות ומספרים (ללא תווים מיוחדים או רווחים)");
  if (!/[A-Za-z]/.test(pwd)) errors.push("הסיסמה חייבת לכלול לפחות אות אחת");
  if (!/\d/.test(pwd)) errors.push("הסיסמה חייבת לכלול לפחות ספרה אחת");
  return errors;
}
