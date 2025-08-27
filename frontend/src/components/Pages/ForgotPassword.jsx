import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = process.env.REACT_APP_API_URL;

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${api}/auth/reset-password`, {
        token,
        password,
      });
      setMessage(res.data.message);
      if (res.data.success) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setMessage("שגיאה באיפוס סיסמה");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">הגדרת סיסמה חדשה</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="סיסמה חדשה"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded">
            שמור סיסמה
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
