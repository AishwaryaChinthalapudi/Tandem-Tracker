# Tandem Tracker 🤝

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Express](https://img.shields.io/badge/Backend-Node%20%2B%20Express-339933)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)

A sleek, full-stack habit accountability application designed for partners. Tandem Tracker allows two users to securely link their accounts, track their daily habits, and monitor each other's progress in real-time.

## ✨ Features

- **Partner Linking**: Generate and share a 6-digit secure code to link your dashboard with an accountability partner.
- **Advanced Gamification**: Automatic streak tracking that calculates consecutive completions across calendar weeks.
- **Monthly Analytics**: Real-time progress bars showing your monthly completion rate against custom weekly targets (e.g., 3 days a week vs. 7 days a week).
- **Time Travel**: A per-habit week navigator that lets you scroll back in time to view historical data.
- **Modern Glassmorphism UI**: A fully responsive, dark-mode-first aesthetic with smooth animations and CSS grid layouts.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router, Context API, Vanilla CSS (Glassmorphism design system)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens), bcrypt.js
- **HTTP Client**: Axios

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v16+)
- MongoDB connection string (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/tandem-tracker.git
cd tandem-tracker
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000
```
Start the Vite development server:
```bash
npm run dev
```

## 🌐 Deployment Architecture

- The **Frontend** is optimized for deployment on Vercel.
- The **Backend** is designed as a standalone Node.js process, optimized for Render.com or Heroku.

## 📄 License

This project is licensed under the MIT License.
