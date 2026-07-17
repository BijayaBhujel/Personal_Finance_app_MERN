require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();


const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

// MIDDLEWARE
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.set('etag', false);

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB ATLAS (cloud)"))
  .catch((err) => console.log("Connection Error", err));

// ─── SCHEMAS ────────────────────────────────────────────────

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:{ type: String, required: true, unique: true},
  resetToken : String,
  resetTokenExpiry: Date,
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const financeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: String,
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
  category: String
});

const monthlySnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  monthName: String,
  savedAt: { type: Date, default: Date.now },
  transactions: { type: mongoose.Schema.Types.Mixed, default: [] },
  totalIncome: Number,
  totalExpense: Number,
  balance: Number
});

// ─── MODELS ─────────────────────────────────────────────────
const User = mongoose.model("User", userSchema);
const Finance = mongoose.model("Finance", financeSchema);
const MonthlySnapshot = mongoose.model("MonthlySnapshot", monthlySnapshotSchema);

// ─── AUTH MIDDLEWARE ─────────────────────────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ─── AUTH ROUTES ─────────────────────────────────────────────

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Valid email required" });
    }
    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

// ─── TRANSACTION ROUTES (protected) ──────────────────────────

app.get("/", (req, res) => res.send("Finance API is running"));

app.get("/transactions", authMiddleware, (req, res) => {
  Finance.find({ userId: req.userId })
    .then((data) => res.json(data))
    .catch(() => res.status(500).send("Error fetching transactions"));
});

app.post("/add-transaction", authMiddleware, (req, res) => {
  const transaction = new Finance({
    userId: req.userId,
    type: req.body.type,
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category,
    date: req.body.date
  });
  transaction.save()
    .then(() => res.send("Transaction saved"))
    .catch(() => res.status(500).send("Error saving transaction"));
});

app.delete("/delete-transaction/:id", authMiddleware, async (req, res) => {
  try {
    await Finance.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting transaction" });
  }
});

app.delete("/restart-transactions", authMiddleware, async (req, res) => {
  try {
    await Finance.deleteMany({ userId: req.userId });
    res.json({ message: "All transactions cleared!" });
  } catch (error) {
    res.status(500).json({ error: "Error clearing transactions" });
  }
});

// ─── MONTHLY SNAPSHOT ROUTES (protected) ─────────────────────

app.post("/save-month", authMiddleware, async (req, res) => {
  try {
    const { monthName, transactions, totalIncome, totalExpense, balance } = req.body;

    const existing = await MonthlySnapshot.findOne({ monthName, userId: req.userId });
    if (existing) {
      await MonthlySnapshot.findOneAndUpdate(
        { monthName, userId: req.userId },
        { transactions, totalIncome, totalExpense, balance }
      );
      return res.json({ message: "Month updated successfully!" });
    }

    const snapshot = new MonthlySnapshot({
      userId: req.userId,
      monthName,
      transactions,
      totalIncome,
      totalExpense,
      balance
    });
    await snapshot.save();

    const count = await MonthlySnapshot.countDocuments({ userId: req.userId });
    if (count > 12) {
      const oldest = await MonthlySnapshot.findOne({ userId: req.userId }).sort({ savedAt: 1 });
      await MonthlySnapshot.findByIdAndDelete(oldest._id);
    }

    res.json({ message: "Month saved successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error saving month snapshot" });
  }
});

app.get("/saved-months", authMiddleware, async (req, res) => {
  try {
    const months = await MonthlySnapshot.find({ userId: req.userId })
      .sort({ savedAt: -1 })
      .select("monthName savedAt totalIncome totalExpense balance");
    res.json(months);
  } catch (error) {
    res.status(500).json({ error: "Error fetching saved months" });
  }
});

app.get("/saved-months/:id", authMiddleware, async (req, res) => {
  try {
    const snapshot = await MonthlySnapshot.findOne({ _id: req.params.id, userId: req.userId });
    if (!snapshot) return res.status(404).json({ error: "Month not found" });
    res.json(snapshot);
  } catch (error) {
    res.status(500).json({ error: "Error fetching month data" });
  }
});
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond the same way, whether or not the email exists.
    // This prevents attackers from using this endpoint to check which emails are registered.
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate a random, unguessable token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store a HASH of the token in the DB, not the raw token itself
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour from now
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset your Personal Finance password",
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      `
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error processing request" });
  }
});
app.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Hash the incoming token the same way, then look it up
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: Date.now() } // must not be expired
    });

    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or has expired" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Error resetting password" });
  }
});

// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));