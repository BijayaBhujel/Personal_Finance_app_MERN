import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import API from "./api/axiosConfig";
import ChartPage from "./ChartPage";
import TransactionsPage from "./TransactionsPage";
import Login from "./Login";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Register from "./Register";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("Food");
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  const username = localStorage.getItem("username");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
  if (localStorage.getItem("token")) {
    fetchTransactions();
   }
  }, []);
  const fetchTransactions = async () => {
    try {
      const res = await API.get("/transactions");
      setTransactions(res.data);
      calculateBalance(res.data);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const calculateBalance = (data) => {
    let total = 0;
    data.forEach((t) => {
      if (t.type === "income") total += Number(t.amount);
      else total -= Number(t.amount);
    });
    setBalance(total);
  };

  const addTransaction = async () => {
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
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
      try {
        const res = await API.get("/transactions");
        const currentTransactions = res.data;

        let totalIncome = 0;
        let totalExpense = 0;
        currentTransactions.forEach((t) => {
          if (t.type === "income") totalIncome += Number(t.amount);
          else totalExpense += Number(t.amount);
        });
        const currentBalance = totalIncome - totalExpense;

        const monthName = new Date().toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        await API.post("/save-month", {
          monthName,
          transactions: currentTransactions,
          totalIncome,
          totalExpense,
          balance: currentBalance,
        });

        await API.delete("/restart-transactions");
        fetchTransactions();
        alert(`${monthName} saved! Ready for a new month.`);
      } catch (error) {
        console.error("Error restarting transactions", error);
        alert("Error saving month. Please try again.");
      }
    }
  };

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  window.location.href = "/login";
};

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
        
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" />} />

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
                          <option>Other</option>
                        </select>
                      </div>
                    )}

                    <button onClick={addTransaction}>Add</button>

                    <h3>
                      Current Balance:
                      <span style={{ color: balance >= 0 ? "black" : "red" }}>
                        {" "}Rs. {balance}
                      </span>
                    </h3>

                    <h4>Transactions:</h4>

                    {transactions.length === 0 ? (
                      <p>No Transactions Yet</p>
                    ) : (
                      <ul>
                        {transactions.map((t) => (
                          <li key={t._id}>
                            <strong>
                              {t.type === "income" ? "INCOME" : "EXPENSE"} :
                              {t.type === "income" ? "+" : "-"}
                              Rs. {t.amount}
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