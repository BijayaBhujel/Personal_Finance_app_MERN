import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import API from "./api/axiosConfig";
import ChartPage from "./ChartPage";
import TransactionsPage from "./TransactionsPage";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("Food");
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalSaving, setTotalSaving] = useState(0);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const username = localStorage.getItem("username");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await API.get("/transactions");
      const sorted = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(sorted);
      calculateTotals(sorted);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
    setLoading(false);
  };

  const calculateTotals = (data) => {
    let income = 0;
    let expense = 0;
    let saving = 0;
    data.forEach((t) => {
      if (t.type === "income") income += Number(t.amount);
      else if (t.type === "expense") expense += Number(t.amount);
      else if (t.type === "saving") saving += Number(t.amount);
    });
    setTotalIncome(income);
    setTotalExpense(expense);
    setTotalSaving(saving);
    setBalance(income - expense - saving);
  };

  const addTransaction = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    setAdding(true);
    try {
      await API.post("/add-transaction", {
        amount: Number(amount),
        description,
        type,
        category: type === "expense" ? category : "",
        date: new Date(),
      });
      setAmount("");
      setDescription("");
      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction", error);
    }
    setAdding(false);
  };

  const deleteTransaction = async (id) => {
    try {
      await API.delete(`/delete-transaction/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const restartTransactions = async () => {
    const confirmRestart = window.confirm(
      "Are you sure you want to clear all transactions? Current month will be saved automatically."
    );
    if (confirmRestart) {
      setLoading(true);
      try {
        const res = await API.get("/transactions");
        const currentTransactions = res.data;

        let inc = 0, exp = 0, sav = 0;
        currentTransactions.forEach((t) => {
          if (t.type === "income") inc += Number(t.amount);
          else if (t.type === "expense") exp += Number(t.amount);
          else if (t.type === "saving") sav += Number(t.amount);
        });

        const monthName = new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        await API.post("/save-month", {
          monthName,
          transactions: currentTransactions,
          totalIncome: inc,
          totalExpense: exp,
          totalSaving: sav,
          balance: inc - exp - sav,
        });

        await API.delete("/restart-transactions");
        fetchTransactions();
        alert(`${monthName} saved! Ready for a new month.`);
      } catch (error) {
        console.error("Error restarting transactions", error);
        alert("Error saving month. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "/login";
  };

  const Spinner = () => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 0",
      gap: "12px"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #3182ce",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#718096", fontSize: "0.9rem" }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const Navbar = () => (
    <nav className="navbar">
      <Link to="/transactions">Transactions</Link>
      <Link to="/chart">Chart</Link>
      <button onClick={restartTransactions}>Restart Month</button>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );

  return (
    <Router>
      <div className="container">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Transactions Page - Protected */}
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <TransactionsPage>
                    <h2>Welcome, {username}!</h2>

                    <label>Amount:</label>
                    <input
                      type="number"
                      placeholder="Enter Amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />

                    <label>Description:</label>
                    <input
                      type="text"
                      placeholder="Enter Description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />

                    <div className="radio-group">
                      <label>
                        <input
                          type="radio"
                          value="income"
                          checked={type === "income"}
                          onChange={(e) => setType(e.target.value)}
                        />
                        Income
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="expense"
                          checked={type === "expense"}
                          onChange={(e) => setType(e.target.value)}
                        />
                        Expense
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="saving"
                          checked={type === "saving"}
                          onChange={(e) => setType(e.target.value)}
                        />
                        Saving
                      </label>
                    </div>

                    {type === "expense" && (
                      <div className="category-group">
                        <label>Category:</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option>Food</option>
                          <option>Rent</option>
                          <option>Travel</option>
                          <option>Entertainment</option>
                          <option>Shopping</option>
                          <option>Fuel</option>
                          <option>Other</option>
                        </select>
                      </div>
                    )}

                    <button onClick={addTransaction} disabled={adding}>
                      {adding ? "Adding..." : "Add"}
                    </button>

                    {/* SUMMARY */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      margin: "16px 0",
                      padding: "16px",
                      background: "#f7fafc",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#4a5568", fontWeight: "500" }}>Total Income</span>
                        <span style={{ color: "#38a169", fontWeight: "700" }}>+{totalIncome}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#4a5568", fontWeight: "500" }}>Total Expense</span>
                        <span style={{ color: "#e53e3e", fontWeight: "700" }}>-{totalExpense}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#4a5568", fontWeight: "500" }}>Total Saving</span>
                        <span style={{ color: "#3182ce", fontWeight: "700" }}>{totalSaving}</span>
                      </div>
                      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "4px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#1a202c", fontWeight: "700", fontSize: "1.1rem" }}>Balance</span>
                        <span style={{
                          color: balance >= 0 ? "#2b6cb0" : "#e53e3e",
                          fontWeight: "700",
                          fontSize: "1.1rem"
                        }}>
                          {balance}
                        </span>
                      </div>
                    </div>

                    <h4>Transactions:</h4>

                    {loading ? (
                      <Spinner />
                    ) : transactions.length === 0 ? (
                      <p>No Transactions Yet</p>
                    ) : (
                      <ul>
                        {transactions.map((t) => (
                          <li key={t._id} style={{
                            borderLeft: `5px solid ${
                              t.type === "income" ? "#38a169" :
                              t.type === "saving" ? "#3182ce" : "#e53e3e"
                            }`
                          }}>
                            <strong>
                              {t.type === "income" ? "INCOME" :
                               t.type === "saving" ? "SAVING" : "EXPENSE"} :
                              {t.type === "income" ? "+" : t.type === "saving" ? "" : "-"}
                              {t.amount}
                            </strong>
                            <div>{t.description}</div>
                            <small>{new Date(t.date).toLocaleString()}</small>
                            <button onClick={() => deleteTransaction(t._id)}>
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </TransactionsPage>
                </>
              </ProtectedRoute>
            }
          />

          {/* Chart Page - Protected */}
          <Route
            path="/chart"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <ChartPage transactions={transactions} />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;