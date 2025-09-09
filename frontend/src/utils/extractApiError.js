// frontend\src\utils\extractApiError.js

const extractApiError = (err, fallback = "שגיאה כללית") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

export default extractApiError;
