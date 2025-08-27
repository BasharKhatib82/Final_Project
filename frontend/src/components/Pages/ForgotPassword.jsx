import { useState } from "react";
import axios from "axios";

const api = process.env.REACT_APP_API_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${api}/auth/forgot-password`, { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage("שגיאה בשליחת בקשה");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 font-rubik">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4">איפוס סיסמה</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-sm mb-1">אימייל:</label>
            <input
              type="email"
              required
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded">
            שלח לינק לאיפוס
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
