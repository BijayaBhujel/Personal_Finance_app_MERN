import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "./api/axiosConfig";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await API.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "20px" }}>
      <h2>Forgot Password</h2>
      <p>Enter your email and we'll send you a reset link.</p>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
      />

      <button onClick={handleSubmit} disabled={loading || !email}>
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {message && <p style={{ marginTop: "12px" }}>{message}</p>}

      <p style={{ marginTop: "16px" }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;