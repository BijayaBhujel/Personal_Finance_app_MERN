import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username === "Myfinance" && password === "finance123") {
      localStorage.setItem("isLoggedIn", "true");
      navigate("/transactions");
    } else {
      setError("Invalid username or password");
    }
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
        <h2 style={{
          textAlign: "center",
          marginBottom: "8px",
          color: "#1a202c",
          fontSize: "1.8rem",
          fontWeight: "600",
        }}>
          Personal Finance
        </h2>
        <p style={{
          textAlign: "center",
          color: "#718096",
          marginBottom: "32px",
          fontSize: "0.95rem",
        }}>
          Sign in to manage your finances
        </p>

        <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#4a5568" }}>
          Username
        </label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "16px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "1rem",
            background: "#f7fafc",
            boxSizing: "border-box",
          }}
        />

        <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#4a5568" }}>
          Password
        </label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "8px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "1rem",
            background: "#f7fafc",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p style={{
            color: "#e53e3e",
            fontSize: "0.9rem",
            marginBottom: "16px",
            textAlign: "center",
          }}>
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            background: "#3182ce",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.05rem",
            fontWeight: "600",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;