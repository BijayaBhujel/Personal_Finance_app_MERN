require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL || "*"
}));
app.use(express.json());

// CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB ATLAS (cloud)"))
  .catch((err) => {
    console.log("Connection Error", err);
  });

// ─── SCHEMAS ────────────────────────────────────────────────

// Current transactions schema
const financeSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  description: String,
  date: {
    type: Date,
    default: Date.now
  },
  category: String
});

// Monthly snapshot schema (saved when Restart Month is clicked)
const monthlySnapshotSchema = new mongoose.Schema({
  monthName: String,        // e.g. "June 2026"
  savedAt: {
    type: Date,
    default: Date.now
  },
  transactions: [
    {
      type: String,
      amount: Number,
      description: String,
      date: Date,
      category: String
    }
  ],
  totalIncome: Number,
  totalExpense: Number,
  balance: Number
});

// ─── MODELS ─────────────────────────────────────────────────
const Finance = mongoose.model("Finance", financeSchema);
const MonthlySnapshot = mongoose.model("MonthlySnapshot", monthlySnapshotSchema);

// ─── CURRENT TRANSACTIONS ROUTES ────────────────────────────

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Finance API is running");
});

// GET ALL TRANSACTIONS
app.get("/transactions", (req, res) => {
  Finance.find()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error fetching transactions");
    });
});

// ADD TRANSACTION
app.post("/add-transaction", (req, res) => {
  const transaction = new Finance({
    type: req.body.type,
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category,
    date: req.body.date
  });

  transaction.save()
    .then(() => {
      res.send("Transaction saved");
    })
    .catch((err) => {
      res.status(500).send("Error saving transaction");
    });
});

// DELETE TRANSACTION BY ID
app.delete("/delete-transaction/:id", async (req, res) => {
  console.log("Deleting id:", req.params.id);
  try {
    await Finance.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting transaction" });
  }
});

// DELETE ALL TRANSACTIONS (Restart Month)
app.delete("/restart-transactions", async (req, res) => {
  try {
    await Finance.deleteMany({});
    res.json({ message: "All transactions cleared for the new month!" });
  } catch (error) {
    res.status(500).json({ error: "Error clearing transactions" });
  }
});

// ─── MONTHLY SNAPSHOT ROUTES ────────────────────────────────

// SAVE CURRENT MONTH SNAPSHOT
app.post("/save-month", async (req, res) => {
  try {
    const { monthName, transactions, totalIncome, totalExpense, balance } = req.body;

    // Check if snapshot for this month already exists
    const existing = await MonthlySnapshot.findOne({ monthName });
    if (existing) {
      return res.json({ message: "Snapshot for this month already exists" });
    }

    // Create new snapshot
    const snapshot = new MonthlySnapshot({
      monthName,
      transactions,
      totalIncome,
      totalExpense,
      balance
    });

    await snapshot.save();

    // Keep only the latest 12 months — delete oldest if more than 12
    const count = await MonthlySnapshot.countDocuments();
    if (count > 12) {
      const oldest = await MonthlySnapshot.findOne().sort({ savedAt: 1 });
      await MonthlySnapshot.findByIdAndDelete(oldest._id);
    }

    res.json({ message: "Month saved successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving month snapshot" });
  }
});

// GET ALL SAVED MONTHS (list for dropdown)
app.get("/saved-months", async (req, res) => {
  try {
    const months = await MonthlySnapshot.find()
      .sort({ savedAt: -1 })
      .select("monthName savedAt totalIncome totalExpense balance");
    res.json(months);
  } catch (error) {
    res.status(500).json({ error: "Error fetching saved months" });
  }
});

// GET ONE MONTH'S FULL DATA
app.get("/saved-months/:id", async (req, res) => {
  try {
    const snapshot = await MonthlySnapshot.findById(req.params.id);
    if (!snapshot) {
      return res.status(404).json({ error: "Month not found" });
    }
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: "Error fetching month data" });
  }
});

// ─── START SERVER ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});