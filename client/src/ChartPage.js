import React, { useEffect, useState } from "react";
import API from "./api/axiosConfig";
import CategoryPieChart from "./CategoryPieChart";

function ChartPage({ transactions }) {
  const [savedMonths, setSavedMonths] = useState([]);
  const [selectedMonthId, setSelectedMonthId] = useState("");
  const [selectedMonthData, setSelectedMonthData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch list of saved months on load
  useEffect(() => {
    fetchSavedMonths();
  }, []);

  const fetchSavedMonths = async () => {
    try {
      const res = await API.get("/saved-months");
      setSavedMonths(res.data);
    } catch (error) {
      console.error("Error fetching saved months", error);
    }
  };

  // Fetch full data when a month is selected
  const handleMonthChange = async (e) => {
    const id = e.target.value;
    setSelectedMonthId(id);

    if (!id) {
      setSelectedMonthData(null);
      return;
    }

    setLoading(true);
    try {
      const res = await API.get(`/saved-months/${id}`);
      setSelectedMonthData(res.data);
    } catch (error) {
      console.error("Error fetching month data", error);
    }
    setLoading(false);
  };

  return (
    <div style={{
      padding: "20px",
      maxWidth: "600px",
      margin: "0 auto",
      minHeight: "80vh",
    }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Charts</h2>

      {/* Previous Months Dropdown */}
      {savedMonths.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#4a5568"
          }}>
            View Previous Month:
          </label>
          <select
            value={selectedMonthId}
            onChange={handleMonthChange}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "1rem",
              background: "#f7fafc",
              cursor: "pointer",
            }}
          >
            <option value="">-- Current Month --</option>
            {savedMonths.map((m) => (
              <option key={m._id} value={m._id}>
                {m.monthName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ textAlign: "center", color: "#718096" }}>Loading...</p>
      )}

      {/* Previous Month View */}
      {selectedMonthData && !loading && (
        <div>
          <h3 style={{ textAlign: "center", marginBottom: "8px", color: "#2d3748" }}>
            {selectedMonthData.monthName}
          </h3>

          {/* Summary cards */}
          <div style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}>
            <div style={{
              flex: 1,
              background: "#f0fff4",
              border: "1px solid #c6f6d5",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.85rem", color: "#276749" }}>Total Income</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#276749" }}>
                +{selectedMonthData.totalIncome}
              </div>
            </div>
            <div style={{
              flex: 1,
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.85rem", color: "#9b2c2c" }}>Total Expense</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#9b2c2c" }}>
                -{selectedMonthData.totalExpense}
              </div>
            </div>
            <div style={{
              flex: 1,
              background: selectedMonthData.balance >= 0 ? "#ebf8ff" : "#fff5f5",
              border: `1px solid ${selectedMonthData.balance >= 0 ? "#bee3f8" : "#fed7d7"}`,
              borderRadius: "10px",
              padding: "12px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "0.85rem", color: "#2c5282" }}>Balance</div>
              <div style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                color: selectedMonthData.balance >= 0 ? "#2b6cb0" : "#c53030"
              }}>
                {selectedMonthData.balance}
              </div>
            </div>
          </div>

          {/* Pie chart for previous month */}
          <CategoryPieChart transactions={selectedMonthData.transactions} />

          {/* Transaction list */}
          <h4 style={{ marginTop: "24px", marginBottom: "12px" }}>Transactions:</h4>
          {selectedMonthData.transactions.length === 0 ? (
            <p>No transactions for this month.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {selectedMonthData.transactions.map((t, index) => (
                <li key={index} style={{
                  padding: "12px 16px",
                  marginBottom: "10px",
                  borderRadius: "10px",
                  background: t.type === "income" ? "#f0fff4" : "#fff5f5",
                  borderLeft: `5px solid ${t.type === "income" ? "#38a169" : "#e53e3e"}`,
                  border: `1px solid ${t.type === "income" ? "#c6f6d5" : "#fed7d7"}`,
                }}>
                  <strong>
                    {t.type === "income" ? "INCOME" : "EXPENSE"} :
                    {t.type === "income" ? "+" : "-"}
                    {t.amount}
                  </strong>
                  <div>{t.description}</div>
                  <small style={{ color: "#718096" }}>
                    {new Date(t.date).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Current Month Chart */}
      {!selectedMonthData && !loading && (
        <CategoryPieChart transactions={transactions} />
      )}
    </div>
  );
}

export default ChartPage;