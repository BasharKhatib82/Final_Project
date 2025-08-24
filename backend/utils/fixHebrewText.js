// frontend/src/utils/fixHebrewText.js

function fixHebrewText(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.split("").reverse().join(""))
    .reverse()
    .join(" ");
}
export default fixHebrewText;
