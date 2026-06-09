// CategoryPieChart.jsx
import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#FF6384", // red-pink
  "#36A2EB", // blue
  "#FFCE56", // yellow
  "#4BC0C0", // teal
  "#9966FF", // purple
  "#FF9F40", // orange
  "#E7E9ED", // light gray
  "#C9CBCF", // darker gray
];

function CategoryPieChart({ transactions }) {
  const [showChart, setShowChart] = useState(true);

  // Filter only expenses
  const expenses = transactions.filter((t) => t.type === "expense");

  // Group by category
  const categoryMap = {};

  expenses.forEach((t) => {
    const cat = t.category || "Other";
    if (categoryMap[cat]) {
      categoryMap[cat] += Number(t.amount);
    } else {
      categoryMap[cat] = Number(t.amount);
    }
  });

  const chartData = Object.keys(categoryMap).map((key) => ({
    name: key,
    value: categoryMap[key],
  }));

  // Calculate total expense
  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);

  if (!showChart) {
    return (
      <div style={{ textAlign: "center", margin: "80px 0" }}>
        <button
          onClick={() => setShowChart(true)}
          style={{
            padding: "12px 40px",
            fontSize: "18px",
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          Show Expense Chart
        </button>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <p style={{ textAlign: "center", color: "#777", fontSize: "18px" }}>
        No expenses recorded yet...
      </p>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h3 style={{ marginBottom: "8px", fontSize: "1.4rem" }}>
        Expenses by Category
      </h3>

      <p style={{ color: "#555", marginBottom: "20px", fontSize: "1.1rem" }}>
        Total: ${totalExpense.toFixed(2)}
      </p>

      {/* Chart container with fixed height – important for iOS/Safari */}
      <div
        style={{
          width: "100%",
          height: "460px",           // increased height helps a lot on mobile
          minHeight: "400px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="45%"                      // slightly left to give space for legend
              cy="50%"
              outerRadius={110}             // good size for mobile & desktop
              labelLine={true}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, "Amount"]} />

            {/* Vertical legend on the right – fixes mobile cutoff issues */}
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{
                paddingLeft: "30px",
                fontSize: "14px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Hide button */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => setShowChart(false)}
          style={{
            padding: "10px 30px",
            fontSize: "16px",
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          Hide Chart
        </button>
      </div>
    </div>
  );
}

export default CategoryPieChart;