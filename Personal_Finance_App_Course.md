# 📚 Personal Finance App — Complete Course
### Based on YOUR project: `Personal_Finance_app_MERN`

---

## 🗺️ COURSE OUTLINE

1. What is MERN Stack?
2. How YOUR project is structured
3. How the Frontend works (React)
4. How the Backend works (Express + Node)
5. How the Database works (MongoDB + Mongoose)
6. How Authentication works (JWT)
7. How Deployment works (Vercel + Render)
8. Common Errors & How to Fix Them
9. Case Studies — Real Client Complaints
10. How to Add New Features

---

## 1. WHAT IS MERN STACK?

MERN is 4 technologies working together:

```
M — MongoDB     → Database (stores your data)
E — Express     → Backend framework (handles requests)
R — React       → Frontend (what users see)
N — Node.js     → Runtime (runs JavaScript on server)
```

Think of it like a restaurant:
- **MongoDB** = Kitchen storage (ingredients/data)
- **Express** = Chef (processes orders/requests)
- **React** = The menu & dining room (what customer sees)
- **Node.js** = The restaurant building (runs everything)

---

## 2. HOW YOUR PROJECT IS STRUCTURED

```
finance-app/
├── backend/                  ← Server side (Node + Express)
│   ├── server.js             ← Main server file
│   ├── .env                  ← Secret keys (never push to GitHub)
│   └── package.json          ← Backend dependencies
│
└── client/                   ← Client side (React)
    ├── src/
    │   ├── App.js            ← Main React component
    │   ├── Login.js          ← Login page
    │   ├── Register.js       ← Register page
    │   ├── ForgotPassword.js ← Forgot password page
    │   ├── ResetPassword.js  ← Reset password page
    │   ├── ChartPage.js      ← Chart page
    │   ├── CategoryPieChart.js → Pie chart component
    │   ├── TransactionsPage.js → Transactions wrapper
    │   ├── ProtectedRoute.js ← Guards private pages
    │   └── api/
    │       └── axiosConfig.js → API configuration
    └── package.json          ← Frontend dependencies
```

### How data flows in your app:
```
User clicks "Add" 
  → React (App.js) collects form data
  → Axios sends POST request to Express backend
  → Express validates and saves to MongoDB
  → Express sends success response
  → React refreshes transaction list
```

---

## 3. HOW THE FRONTEND WORKS (REACT)

### What is React?
React builds your UI from **components** — reusable pieces of UI.

### Key concepts in YOUR project:

#### A. useState — Storing data in memory
```js
const [amount, setAmount] = useState("");
```
- `amount` = current value
- `setAmount` = function to change it
- `""` = starting value
- When state changes → React re-renders the component

**In your app:** Every input field (amount, description, type) has its own state.

#### B. useEffect — Running code on page load
```js
useEffect(() => {
  fetchTransactions();
}, []);
```
- Runs `fetchTransactions()` when the page first loads
- `[]` = only run once (on mount)
- Without `[]` it would run every time anything changes

**In your app:** Loads transactions from backend when page opens.

#### C. Axios — Talking to your backend
```js
const res = await API.get("/transactions");
const res = await API.post("/add-transaction", { data });
const res = await API.delete("/delete-transaction/123");
```
- `GET` = fetch data
- `POST` = send new data
- `DELETE` = remove data
- `await` = wait for the response before continuing

#### D. React Router — Multiple pages
```js
<Route path="/transactions" element={<TransactionsPage />} />
<Route path="/chart" element={<ChartPage />} />
<Route path="/login" element={<Login />} />
```
- Changes what's displayed based on the URL
- No actual page reload — React swaps components

#### E. ProtectedRoute — Blocking access
```js
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;
  return children;
}
```
- Checks if user has a JWT token
- If not → redirect to login
- If yes → show the page

---

## 4. HOW THE BACKEND WORKS (EXPRESS + NODE)

### What is Express?
Express listens for HTTP requests and sends responses.

### Your routes explained:

```js
// GET — fetch all transactions for logged in user
app.get("/transactions", authMiddleware, (req, res) => {
  Finance.find({ userId: req.userId })  // only THIS user's data
    .then(data => res.json(data))
});

// POST — add new transaction
app.post("/add-transaction", authMiddleware, (req, res) => {
  const transaction = new Finance({
    userId: req.userId,      // link to user
    type: req.body.type,     // income/expense/saving
    amount: req.body.amount,
    ...
  });
  transaction.save();
});

// DELETE — remove one transaction
app.delete("/delete-transaction/:id", authMiddleware, async (req, res) => {
  await Finance.findOneAndDelete({ 
    _id: req.params.id,      // the transaction ID
    userId: req.userId       // make sure it belongs to THIS user
  });
});
```

### What is authMiddleware?
```js
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;  // attach userId to request
  next();                       // continue to the route
};
```
- Runs BEFORE every protected route
- Reads the JWT token from the request header
- Decodes it to get the userId
- Attaches userId to `req` so routes can use it
- `next()` = "ok, continue to the actual route"

---

## 5. HOW THE DATABASE WORKS (MONGODB + MONGOOSE)

### What is MongoDB?
- Stores data as **documents** (like JSON objects)
- No strict tables like Excel — flexible structure
- Free cloud version: MongoDB Atlas

### What is Mongoose?
- Makes it easier to work with MongoDB in Node.js
- Defines schemas (structure of your data)

### Your schemas explained:

```js
// User schema — stores registered users
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // stored as hash!
  resetToken: String,        // for forgot password
  resetTokenExpiry: Date,    // token expires after 1 hour
});

// Finance schema — stores transactions
const financeSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: "User" },  // links to user
  type: String,      // "income", "expense", "saving"
  amount: Number,
  description: String,
  date: Date,
  category: String,  // "Food", "Rent", etc.
});

// Monthly snapshot — saved when Restart Month clicked
const monthlySnapshotSchema = new mongoose.Schema({
  userId: ObjectId,
  monthName: String,    // "June 2026"
  transactions: Mixed,  // entire month's transactions
  totalIncome: Number,
  totalExpense: Number,
  totalSaving: Number,
  balance: Number,
});
```

### Collections in your MongoDB Atlas:
- `users` — all registered users
- `finances` — all transactions
- `monthlysnapshots` — saved monthly reports

---

## 6. HOW AUTHENTICATION WORKS (JWT)

### The full flow:

```
REGISTER:
User fills form → backend hashes password → saves to DB
→ creates JWT token → sends token to frontend
→ frontend stores token in localStorage

LOGIN:
User enters credentials → backend finds user in DB
→ compares password with hash → if match, creates JWT token
→ sends token to frontend → frontend stores in localStorage

EVERY REQUEST AFTER LOGIN:
Frontend sends token in header: "Authorization: Bearer TOKEN"
→ authMiddleware reads token → verifies it → extracts userId
→ route uses userId to fetch ONLY that user's data

LOGOUT:
Frontend removes token from localStorage
→ ProtectedRoute sees no token → redirects to /login
```

### What is JWT (JSON Web Token)?
```
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjMifQ.SIGNATURE
|___ Header ___|  |___ Payload __|  |_ Signature _|
```
- Contains userId encoded inside
- Signed with your JWT_SECRET
- Cannot be faked without the secret
- Expires after 7 days (in your app)

### What is bcrypt (password hashing)?
```js
// When registering — hash the password:
const hashedPassword = await bcrypt.hash("mypassword123", 10);
// Stores: "$2b$10$X9mF3k..." (unreadable)

// When logging in — compare:
const isMatch = await bcrypt.compare("mypassword123", hashedPassword);
// Returns: true or false
```
- Passwords are NEVER stored as plain text
- Even if database is hacked, passwords are safe
- `10` = how many times to hash (more = slower = safer)

---

## 7. HOW DEPLOYMENT WORKS

### Your deployment architecture:
```
User's Browser
      ↓
  Vercel (Frontend)
  personal-finance-app-mern.vercel.app
      ↓ API calls
  Render (Backend)
  personal-finance-app-mern.onrender.com
      ↓ queries
  MongoDB Atlas (Database)
  mernlearn.pfppndo.mongodb.net
```

### Why 3 separate services?
- **Vercel** = specialized in React/static sites, CDN, fast
- **Render** = specialized in Node.js servers
- **MongoDB Atlas** = specialized in database hosting

### Environment variables — why?
```
# Never hardcode secrets in code!
# BAD:
mongoose.connect("mongodb+srv://user:password@cluster...")

# GOOD:
mongoose.connect(process.env.MONGO_URI)
```
- Keeps secrets out of GitHub
- Different values for local vs production
- If you change a secret, update .env — no code changes

---

## 8. COMMON ERRORS & HOW TO FIX THEM

### ❌ "CORS Error"
```
Access to XMLHttpRequest blocked by CORS policy
```
**What happened:** Frontend domain not allowed by backend
**Fix:** Add frontend URL to CORS config in server.js
```js
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
```

---

### ❌ "Cannot read properties of undefined"
```
TypeError: Cannot read properties of undefined (reading 'map')
```
**What happened:** Trying to use data before it loaded
**Fix:** Add loading state or default value
```js
const [transactions, setTransactions] = useState([]); // default []
```

---

### ❌ "401 Unauthorized"
```
AxiosError: Request failed with status code 401
```
**What happened:** JWT token missing or expired
**Fix:** User needs to log in again. Add auto-logout:
```js
if (error.response?.status === 401) {
  localStorage.removeItem("token");
  window.location.href = "/login";
}
```

---

### ❌ "MongooseError: uri must be a string, got undefined"
**What happened:** MONGO_URI not in .env or .env not loaded
**Fix:** 
1. Check `require('dotenv').config()` is first line in server.js
2. Check .env file exists in backend folder
3. Check MONGO_URI is spelled correctly

---

### ❌ "404 Not Found" on API route
**What happened:** Route doesn't exist in server.js
**Fix:** Check spelling matches exactly between frontend and backend
```js
// Frontend:
API.post("/add-transaction", data)
// Backend must have:
app.post("/add-transaction", ...)
```

---

### ❌ App works locally but not on Vercel/Render
**What happened:** Environment variables not set on deployment platform
**Fix:** Add all .env variables to Render/Vercel dashboard manually

---

### ❌ Render app is slow to respond
**What happened:** Free tier cold start (sleeps after 15 min)
**Fix:** Use UptimeRobot to ping every 5 minutes

---

## 9. CASE STUDIES — REAL CLIENT COMPLAINTS

### 📱 Case 1: "The app is very slow"
**Diagnosis:** Render free tier cold start
**Solution:**
1. Set up UptimeRobot to ping backend every 5 min
2. Add loading spinner so UI doesn't look frozen
3. If budget allows, upgrade to Render paid plan ($7/mo)

---

### 🔐 Case 2: "I forgot my password"
**Diagnosis:** No password reset feature
**Solution:** 
1. Add forgot password route in backend
2. Send reset email with nodemailer
3. Add ForgotPassword.js and ResetPassword.js in frontend
4. Add routes in App.js

---

### 📊 Case 3: "I can't see last month's data"
**Diagnosis:** No monthly history feature
**Solution:**
1. Add MonthlySnapshot schema in backend
2. Save snapshot when Restart Month clicked
3. Add dropdown in ChartPage to view previous months

---

### 👥 Case 4: "My friend used it and saw my transactions"
**Diagnosis:** No user authentication — everyone shares data
**Solution:**
1. Add User schema with bcrypt password hashing
2. Add JWT authentication
3. Add userId to every transaction
4. Filter all queries by userId

---

### 📈 Case 5: "Can you add savings tracking?"
**Diagnosis:** Only income and expense types exist
**Solution:**
1. Add "saving" as a third transaction type in frontend
2. Update calculateTotals() to handle saving separately
3. Update summary display to show savings separately
4. Update balance formula: income - expense - saving

---

### 🔄 Case 6: "New transactions appear at the bottom"
**Diagnosis:** Transactions not sorted by date
**Solution:**
```js
const sorted = res.data.sort((a, b) => 
  new Date(b.date) - new Date(a.date)
);
```

---

## 10. HOW TO ADD NEW FEATURES

### Step-by-step process for any new feature:

```
1. PLAN
   - What does the user want?
   - What data needs to be stored?
   - What UI changes are needed?

2. BACKEND FIRST
   - Do you need a new schema? Add it to server.js
   - Add new routes (GET/POST/DELETE)
   - Test with http://localhost:5000/your-route

3. FRONTEND SECOND
   - Add new state variables if needed
   - Add new UI elements
   - Connect to backend with axios
   - Test locally at localhost:3000

4. DEPLOY
   - git add . && git commit -m "feat: description"
   - git push origin main
   - Vercel and Render auto-deploy
   - Test on live URL
```

### Example: Adding a "Budget Limit" feature
```
PLAN:
- User sets a monthly budget limit
- App warns when spending exceeds 80% of limit

BACKEND:
- Add budgetLimit field to User schema
- Add PUT /update-budget route

FRONTEND:
- Add budget input field in settings
- Calculate percentage spent
- Show warning when > 80%
```

---

## 📝 QUICK REFERENCE

### Git commands you always need:
```bash
git add .                          # stage all changes
git commit -m "description"        # save with message
git push origin main               # upload to GitHub
git log --oneline -5               # see last 5 commits
git status                         # see what changed
```

### NPM commands:
```bash
npm install package-name           # install a package
npm start                          # start the server/app
npm run build                      # build React for production
cat package.json                   # see installed packages
```

### Testing API locally:
```
http://localhost:5000/             → test route
http://localhost:5000/transactions → get transactions
```

### Your live URLs:
```
Frontend: https://personal-finance-app-mern.vercel.app
Backend:  https://personal-finance-app-mern.onrender.com
Database: MongoDB Atlas dashboard
```

---

## 🎯 KEY CONCEPTS SUMMARY

| Concept | What it does | Where in your app |
|---------|-------------|-------------------|
| useState | Stores data in React | amount, transactions, balance |
| useEffect | Runs code on load | fetchTransactions on page open |
| axios | HTTP requests | All API calls |
| React Router | Multiple pages | /login, /transactions, /chart |
| Express routes | Handle requests | GET/POST/DELETE in server.js |
| Mongoose | MongoDB helper | All schemas and queries |
| JWT | Authentication token | Login/Register/ProtectedRoute |
| bcrypt | Password hashing | Register and Login |
| dotenv | Environment variables | All secrets in .env |
| CORS | Allow cross-origin | Frontend talking to backend |
| localStorage | Browser storage | Storing JWT token |

