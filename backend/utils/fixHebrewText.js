// backend/utils/fixHebrewText.js
export default function fixHebrewText(str) {
  if (!str) return "";
  // נהפוך רק את סדר האותיות בתוך מילה, אבל לא את סדר המילים
  return str
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .join(" ");
}
