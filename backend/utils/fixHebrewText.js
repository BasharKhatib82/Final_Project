// utils/fixHebrewText.js
export default function fixHebrewText(str = "") {
  if (typeof str !== "string") return str;

  // מחלקים לפי רווחים (אפשר להרחיב גם לפיסוק בהמשך)
  const words = str.split(/\s+/);

  // הופכים רק מילים עבריות
  const processed = [];
  let buffer = [];

  const isHebrew = (word) => /[\u0590-\u05FF]/.test(word);

  for (const word of words) {
    if (isHebrew(word)) {
      buffer.unshift(word); // צוברים מילים עבריות בסדר הפוך
    } else {
      // כשמגיעים למילה לא עברית - מרוקנים קודם את הבופר
      if (buffer.length) {
        processed.push(...buffer);
        buffer = [];
      }
      processed.push(word);
    }
  }

  // אם נשארו מילים עבריות בסוף
  if (buffer.length) {
    processed.push(...buffer);
  }

  return processed.join(" ");
}
