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

// FINANCE SCHEMA
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

// MODEL
const Finance = mongoose.model("Finance", financeSchema);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Finance API is running");
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

// START SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});