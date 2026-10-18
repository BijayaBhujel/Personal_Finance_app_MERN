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
  const [paidFromSavings, setPaidFromSavings] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalSaving, setTotalSaving] = useState(0);
  const [totalSavings, setTotalSavings] = useState(
    Number(localStorage.getItem("totalSavings")) || 0
  );
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const username = localStorage.getItem("username");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchTransactions();
    fetchSavingsBalance();
  }, []);

  const fetchSavingsBalance = async () => {
    try {
      const res = await API.get("/savings-balance");
      setTotalSavings(res.data.totalSavings);
      localStorage.setItem("totalSavings", res.data.totalSavings);
    } catch (error) {
      console.error("Error fetching savings balance", error);
    }
  };

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
    let income = 0, expense = 0, saving = 0;
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
      const res = await API.post("/add-transaction", {
        amount: Number(amount),
        description,
        type,
        category: type === "expense" ? category : "",
        date: new Date(),
        paidFromSavings: type === "expense" ? paidFromSavings : false,
      });
      setAmount("");
      setDescription("");
      setPaidFromSavings(false);
      if (res.data.totalSavings !== undefined) {
        setTotalSavings(res.data.totalSavings);
        localStorage.setItem("totalSavings", res.data.totalSavings);
      }
      fetchTransactions();
    } catch (error) {
      alert(error.response?.data?.error || "Error adding transaction");
    }
    setAdding(false);
  };

  const deleteTransaction = async (id) => {
    try {
      const res = await API.delete(`/delete-transaction/${id}`);
      if (res.data.totalSavings !== undefined) {
        setTotalSavings(res.data.totalSavings);
        localStorage.setItem("totalSavings", res.data.totalSavings);
      }
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction", error);
    }
  };

  const restartTransactions = async () => {
    const confirmRestart = window.confirm(
      "Are you sure? Monthly transactions will be saved and cleared. Your savings balance will carry over!"
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
        const monthName = new Date().toLocaleString("default", { month: "long", year: "numeric" });
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
        alert(`${monthName} saved! Savings balance carried over ✅`);
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
    localStorage.removeItem("totalSavings");
    window.location.href = "/login";
  };

  const Spinner = () => (
    <div className="spinner-container">
      <div className="spinner" />
      <p className="spinner-text">Loading...</p>
    </div>
  );

  const Navbar = () => (
    <nav className="navbar">
      <Link to="/transactions">Transactions</Link>
      <Link to="/chart">Chart</Link>
      <button className="navbar-btn" onClick={restartTransactions}>Restart Month</button>
      <button className="navbar-btn logout-btn" onClick={handleLogout}>Logout</button>
    </nav>
  );

  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Navigate to="/login" />} />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <TransactionsPage>
                    <h2>Welcome, {username}!</h2>

                    {/* PERSISTENT SAVINGS BANNER */}
                    <div className="savings-banner">
                      <span>💰 Total Savings</span>
                      <span className="savings-amount">{totalSavings}</span>
                    </div>

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
                          onChange={(e) => { setType(e.target.value); setPaidFromSavings(false); }}
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
                          onChange={(e) => { setType(e.target.value); setPaidFromSavings(false); }}
                        />
                        Saving
                      </label>
                    </div>

                    {type === "expense" && (
                      <>
                        <div className="category-group">
                          <label>Category:</label>
                          <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option>Food</option>
                            <option>Rent</option>
                            <option>Travel</option>
                            <option>Fuel</option>
                            <option>Entertainment</option>
                            <option>Shopping</option>
                            <option>Other</option>
                          </select>
                        </div>

                        {/* PAY FROM SAVINGS */}
                        <div className="pay-source-group">
                          <label className="pay-source-label">Pay from:</label>
                          <div className="radio-group">
                            <label>
                              <input
                                type="radio"
                                checked={!paidFromSavings}
                                onChange={() => setPaidFromSavings(false)}
                              />
                              Regular Balance
                            </label>
                            <label>
                              <input
                                type="radio"
                                checked={paidFromSavings}
                                onChange={() => setPaidFromSavings(true)}
                              />
                              Savings ({totalSavings})
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    <button onClick={addTransaction} disabled={adding}>
                      {adding ? "Adding..." : "Add"}
                    </button>

                    {/* SUMMARY */}
                    <div className="summary-box">
                      <div className="summary-row">
                        <span>Total Income</span>
                        <span className="income-text">+{totalIncome}</span>
                      </div>
                      <div className="summary-row">
                        <span>Total Expense</span>
                        <span className="expense-text">-{totalExpense}</span>
                      </div>
                      <div className="summary-row">
                        <span>Total Saving (this month)</span>
                        <span className="saving-text">{totalSaving}</span>
                      </div>
                      <hr className="summary-divider" />
                      <div className="summary-row">
                        <span className="balance-label">Balance</span>
                        <span className={balance >= 0 ? "balance-positive" : "balance-negative"}>
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
                          <li key={t._id} className={`transaction-item ${t.type}`}>
                            <strong>
                              {t.type === "income" ? "INCOME" :
                               t.type === "saving" ? "SAVING" : "EXPENSE"} :
                              {t.type === "income" ? "+" : t.type === "saving" ? "" : "-"}
                              {t.amount}
                              {t.paidFromSavings && (
                                <span className="savings-tag"> (from savings)</span>
                              )}
                            </strong>
                            <div>{t.description}</div>
                            <small>{new Date(t.date).toLocaleString()}</small>
                            <button className="delete-btn" onClick={() => deleteTransaction(t._id)}>
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