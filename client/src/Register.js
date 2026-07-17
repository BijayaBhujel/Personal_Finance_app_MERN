import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "./api/axiosConfig";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/register", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      navigate("/transactions");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)",
    }}>
      <div style={{
        background: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        width: "100%",
        maxWidth: "400px",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "8px", color: "#1a202c", fontSize: "1.8rem", fontWeight: "600" }}>
          Create Account
        </h2>
        <p style={{ textAlign: "center", color: "#718096", marginBottom: "32px", fontSize: "0.95rem" }}>
          Start managing your finances
        </p>

        <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#4a5568" }}>
          Username
        </label>
        <input
          type="text"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px", marginBottom: "16px",
            border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "1rem",
            background: "#f7fafc", boxSizing: "border-box",
          }}
        />

        <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#4a5568" }}>
          Password
        </label>
        <input
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px", marginBottom: "16px",
            border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "1rem",
            background: "#f7fafc", boxSizing: "border-box",
          }}
        />

        <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#4a5568" }}>
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          style={{
            width: "100%", padding: "12px 14px", marginBottom: "8px",
            border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "1rem",
            background: "#f7fafc", boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{ color: "#e53e3e", fontSize: "0.9rem", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </p>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", background: loading ? "#9ae6b4" : "#38a169",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "1.05rem", fontWeight: "600", cursor: "pointer", marginTop: "8px",
          }}
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#718096", fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#3182ce", fontWeight: "600", textDecoration: "none" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;