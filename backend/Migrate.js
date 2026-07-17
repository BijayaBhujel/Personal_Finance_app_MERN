require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Same schemas as server.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

const financeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  type: String,
  amount: Number,
  description: String,
  date: { type: Date, default: Date.now },
  category: String
});

const monthlySnapshotSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  monthName: String,
  savedAt: { type: Date, default: Date.now },
  transactions: { type: mongoose.Schema.Types.Mixed, default: [] },
  totalIncome: Number,
  totalExpense: Number,
  balance: Number
});

const User = mongoose.model("User", userSchema);
const Finance = mongoose.model("Finance", financeSchema);
const MonthlySnapshot = mongoose.model("MonthlySnapshot", monthlySnapshotSchema);

// ─── EDIT THESE THREE VALUES BEFORE RUNNING ───────────────────
const SISTER_USERNAME = "Myfinance";       // her existing username — unchanged
const SISTER_PASSWORD = "finance123";      // her existing password, or set a new one
const SISTER_EMAIL = "bijetab1@gmail.com"; // required for reset-password to work
// ────────────────────────────────────────────────────────────

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // 1. Create her account if it doesn't exist yet, keeping her old username
  let sister = await User.findOne({ username: SISTER_USERNAME });
  if (!sister) {
    const hashedPassword = await bcrypt.hash(SISTER_PASSWORD, 10);
    sister = await User.create({
      username: SISTER_USERNAME,
      email: SISTER_EMAIL,
      password: hashedPassword
    });
    console.log(`Created account for ${SISTER_USERNAME}`);
  } else {
    console.log(`Account already exists for ${SISTER_USERNAME}, reusing it`);
  }

  // 2. Attach every old, ownerless transaction to her account
  const txResult = await Finance.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: sister._id } }
  );
  console.log(`Migrated ${txResult.modifiedCount} transactions to ${SISTER_USERNAME}`);

  // 3. Attach every old, ownerless monthly snapshot to her account
  const snapResult = await MonthlySnapshot.updateMany(
    { userId: { $exists: false } },
    { $set: { userId: sister._id } }
  );
  console.log(`Migrated ${snapResult.modifiedCount} monthly snapshots to ${SISTER_USERNAME}`);

  console.log("Migration complete! Nothing was deleted.");
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});