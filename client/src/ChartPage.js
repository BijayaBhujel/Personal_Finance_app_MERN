// ChartPage.jsx
import React from "react";
import CategoryPieChart from "./CategoryPieChart";

function ChartPage({ transactions }) {
  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        minHeight: "80vh",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Charts
      </h2>

      <CategoryPieChart transactions={transactions} />
    </div>
  );
}

export default ChartPage;