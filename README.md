# Personal Finance Manager (MERN Stack)

A full-stack, multi-user personal finance tracker that lets users create their own account, log income and expenses, visualize spending by category, and archive monthly summaries for later review.

**Live app:** https://personal-finance-app-mern.vercel.app
**Backend API:** https://personal-finance-app-mern.onrender.com

---

## Features

- **Multi-user accounts** — each user registers their own account; all data is private and scoped to that account
- **Secure authentication** — JWT-based login, passwords hashed with bcrypt (never stored in plain text)
- **Forgot password** — users can reset their password via a secure, time-limited email link (no admin intervention needed)
- **Add & delete transactions** — log income or expenses with an amount, description, category, and date
- **Live balance tracking** — balance updates automatically as transactions are added or removed
- **Expense breakdown chart** — interactive pie chart (Recharts) showing spending by category, with in-slice percentage labels
- **Monthly snapshots** — click "Restart Month" to save the current month's data (income, expenses, balance, full transaction list) to the database and start fresh
- **Monthly history** — browse any previously saved month from a dropdown, with its own summary cards and category chart
- **Currency** — all amounts displayed in Rs. (Nepali Rupees)
- **Protected routes** — transaction and chart pages are only accessible after login, using a JWT stored client-side

## Tech Stack

**Frontend**
- React 19
- React Router v7
- Axios (API calls, with automatic JWT attachment via interceptors)
- Recharts (data visualization)

**Backend**
- Node.js + Express 5
- MongoDB Atlas + Mongoose 9
- JWT (jsonwebtoken) for authentication
- bcryptjs for password hashing
- Nodemailer for password-reset emails
- CORS + dotenv for config

**Deployment**
- Backend: Render
- Frontend: Vercel

## Project Structure

```
Personal_Finance_app_MERN/
├── backend/
│   ├── server.js          # Express app, auth routes, transaction routes, MongoDB schemas
│   ├── Migrate.js         # One-time data migration utility (see note below)
│   └── package.json
└── client/
    ├── src/
    │   ├── App.js                # Main app, routing, transaction form/list
    │   ├── ChartPage.js          # Monthly view + saved months dropdown
    │   ├── CategoryPieChart.js   # Recharts pie chart component
    │   ├── Login.js              # Login screen
    │   ├── Register.js           # Account creation screen
    │   ├── ForgotPassword.js     # Request a password reset email
    │   ├── ResetPassword.js      # Set a new password via emailed token
    │   ├── ProtectedRoute.js     # Route guard — checks for a valid JWT
    │   └── api/axiosConfig.js    # Axios instance — attaches JWT to every request
    └── package.json
```

## API Endpoints

| Method | Endpoint | Auth required | Description |
|--------|----------|:---:|--------------|
| POST | `/register` | No | Create a new user account |
| POST | `/login` | No | Log in, returns a JWT |
| POST | `/forgot-password` | No | Email a password-reset link |
| POST | `/reset-password/:token` | No | Set a new password using the emailed token |
| GET | `/transactions` | Yes | Get the logged-in user's transactions |
| POST | `/add-transaction` | Yes | Add a new transaction |
| DELETE | `/delete-transaction/:id` | Yes | Delete a transaction by ID |
| DELETE | `/restart-transactions` | Yes | Clear all current transactions |
| POST | `/save-month` | Yes | Save a snapshot of the current month |
| GET | `/saved-months` | Yes | List all saved monthly snapshots |
| GET | `/saved-months/:id` | Yes | Get full data for one saved month |

Protected routes require an `Authorization: Bearer <token>` header, obtained from `/login` or `/register`.

## Getting Started

### Prerequisites
- Node.js installed
- A MongoDB Atlas connection string
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for password-reset emails)

### 1. Clone the repo
```bash
git clone https://github.com/BijayaBhujel/Personal_Finance_app_MERN.git
cd Personal_Finance_app_MERN
```

### 2. Set up the backend
```bash
cd backend
npm install
```
Create a `.env` file in `backend/`:
```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=any_long_random_string
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password
PORT=5000
```
Run the server:
```bash
npm start
```

### 3. Set up the frontend
```bash
cd ../client
npm install
```
In `src/api/axiosConfig.js`, make sure `baseURL` points to your local backend during development:
```js
baseURL: "http://localhost:5000"
```
Run the app:
```bash
npm start
```

The app will be available at `http://localhost:3000`.

## Deployment Notes

- **Environment variables must be set on the hosting platform** (Render), not just locally — `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `EMAIL_USER`, and `EMAIL_APP_PASSWORD` all need to be added in Render's Environment tab.
- **`CLIENT_URL`** must match the deployed frontend's exact URL — it's used for CORS and for building password-reset links.
- **`axiosConfig.js`'s `baseURL`** must point to the deployed backend URL before deploying the frontend, not `localhost`.

## Migration Utility

`backend/Migrate.js` is a one-time script used to migrate legacy data (from an earlier single-login version of this app, before multi-user accounts existed) into the new account-based structure. It's safe to re-run — it only affects transactions/snapshots with no `userId`, and skips creating a duplicate account if one already exists. Not needed for a fresh install.

## Roadmap

- Editing existing transactions (currently only add/delete)
- Date-range filtering beyond current month vs. saved snapshots
- Rate-limiting on `/forgot-password` to prevent email spam

## Author

**Bijaya Bhujel**
[GitHub](https://github.com/BijayaBhujel)
