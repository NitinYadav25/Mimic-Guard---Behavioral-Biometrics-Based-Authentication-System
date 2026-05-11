# 🔐 BehaviorAuth – Adaptive Multi-Factor Authentication System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)](https://www.mongodb.com/atlas)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 📖 Overview

**BehaviorAuth** is a modern, adaptive multi-factor authentication system that goes beyond traditional username/password login. It combines three independent security layers:

1. **Password verification** – standard credential check
2. **Google Authenticator TOTP** – time-based one-time codes (30-second rotating)
3. **Behavioral biometrics** – continuous analysis of *how* you type and move your mouse

Even if an attacker steals your password and gains access to your 2FA code, they cannot replicate your unique behavioral fingerprint. The system dynamically assigns a **trust level** (HIGH / MEDIUM / LOW) based on how closely your behavior at login matches your registered pattern, granting or restricting access accordingly.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔑 **Password Authentication** | Bcrypt-hashed passwords with complexity enforcement |
| 📱 **Google Authenticator (TOTP)** | 30-second HMAC-based time codes via `speakeasy` |
| ⌨️ **Typing Rhythm Analysis** | Keystroke dynamics — dwell time, flight time, WPM patterns |
| 🖱️ **Mouse Movement Analysis** | Velocity, acceleration, and trajectory patterns |
| 🖥️ **Device Fingerprinting** | Browser-level device identity via FingerprintJS |
| 🛡️ **Adaptive Trust Access** | HIGH / MEDIUM / LOW trust levels with scoped permissions |
| 📊 **Biometric Similarity Score** | Real-time similarity score compared to enrolled baseline |
| 🌍 **Location-Based IP Control** | Restrict login to approved IP addresses / networks |
| ⚛️ **Modern React UI** | Vite + React 18 + Tailwind CSS — responsive and animated |

---

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Login Attempt                         │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  Step 1: Password   │  ← bcrypt verify
              │  + Biometric Capture│  ← typing & mouse
              └──────────┬──────────┘
                         │ ✅ Pass
              ┌──────────▼──────────┐
              │  Step 2: TOTP Code  │  ← Google Authenticator
              │  (6-digit, 30s)     │  ← speakeasy verify
              └──────────┬──────────┘
                         │ ✅ Pass
              ┌──────────▼──────────┐
              │  Step 3: Biometric  │  ← compare vs baseline
              │  Similarity Check   │  ← typing + mouse score
              └──────────┬──────────┘
                         │
           ┌─────────────┼─────────────┐
           │             │             │
      ≥ 70% + 2FA   ≥ 70% only     < 70%
           │             │             │
      ┌────▼────┐  ┌─────▼────┐  ┌────▼──────┐
      │  HIGH   │  │  MEDIUM  │  │   LOW     │
      │  TRUST  │  │  TRUST   │  │  TRUST    │
      │Full Access│ │View Only │  │Blocked    │
      └─────────┘  └──────────┘  └───────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **FingerprintJS** | Device fingerprinting |
| **React Router v6** | Client-side routing |

### Backend
| Technology | Role |
|---|---|
| **Node.js + Express** | API server |
| **Speakeasy** | TOTP secret generation & verification |
| **QRCode** | QR code generation for TOTP setup |
| **Mongoose** | MongoDB ODM |
| **bcrypt** | Password hashing |
| **MongoDB Atlas** | Cloud database |

---

## 📐 Biometric Scoring Logic

BehaviorAuth captures two behavioral signals and combines them into a unified similarity score:

```
BiometricScore = (TypingScore + MouseScore) / 2
```

| Score | Trust Decision |
|---|---|
| **≥ 70% + valid TOTP** | ✅ HIGH trust — full access (30 min session) |
| **≥ 70% (TOTP only)** | ⚠️ MEDIUM trust — view-only (10 min session) |
| **< 70%** | ❌ LOW trust — access denied |

**Typing analysis includes:**
- Key dwell time (how long each key is held)
- Inter-key flight time (pause between keystrokes)
- Typing speed and rhythm consistency

**Mouse analysis includes:**
- Movement velocity and acceleration curves
- Path straightness and deviation
- Click timing patterns

---

## 🚀 Installation Guide

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Authenticator app (iOS / Android)

### 1. Clone the repository
```bash
git clone https://github.com/nikilsoni98/MimicGuard.git
cd MimicGuard
```

### 2. Backend setup
```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster.mongodb.net/behaviorauth
ALLOWED_IPS=127.0.0.1,::1
PORT=5000
```

Start the backend:
```bash
node backend/server.js
```
> Server runs at `http://localhost:5000`

### 3. Frontend setup
```bash
cd frontend-react
npm install
npm run dev
```
> App runs at `http://localhost:5173`

### 4. First-time registration
1. Open `http://localhost:5173/register`
2. Fill in username, email, password
3. Move your mouse and type to capture biometric baseline
4. **Scan the QR code** with Google Authenticator
5. Enter the first 6-digit code to confirm 2FA setup
6. Login at `http://localhost:5173/login`

---

## 🔒 Security Highlights

- ✅ **No OTP stored in database** — TOTP tokens are verified in real-time and discarded
- ✅ **TOTP secrets are encrypted per-user** in MongoDB (`totpSecret` field)
- ✅ **Passwords are bcrypt-hashed** (never stored in plain text)
- ✅ **Biometric isolation** — each session captures fresh biometric data for comparison
- ✅ **Trust-level access control** — sensitive actions locked to HIGH trust only
- ✅ **IP allowlist** — restricts logins to approved network locations
- ✅ **Clock drift tolerance** — ±30 seconds for TOTP verification

---

## 📁 Project Structure

```
behaviorauth/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── routes.js          # API routes (register, login, TOTP)
│   ├── userModel.js       # Mongoose schema
│   └── totpService.js     # TOTP generation & verification
├── frontend-react/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx       # Password + TOTP login
│   │   │   ├── Register.jsx    # Registration + TOTP setup
│   │   │   └── Dashboard.jsx   # Trust-gated dashboard
│   │   ├── components/
│   │   │   ├── TOTPVerification.jsx
│   │   │   ├── SimilarityScore.jsx
│   │   │   ├── TrustBanner.jsx
│   │   │   └── AnimatedBackground.jsx
│   │   ├── hooks/
│   │   │   ├── useBiometrics.js
│   │   │   ├── useFingerprint.js
│   │   │   └── useSessionTimeout.js
│   │   └── services/
│   │       └── api.js          # API client
│   └── package.json
├── .env.example
└── package.json
```

---

## 🔮 Future Improvements

- [ ] **Backup recovery codes** — one-time use codes when authenticator app is unavailable
- [ ] **Risk-based IP monitoring** — flag logins from new or suspicious locations
- [ ] **Machine learning anomaly detection** — adaptive threshold tuning over time
- [ ] **Admin dashboard** — manage users, view login history, audit biometric scores
- [ ] **WebAuthn / Passkey support** — hardware key as an additional factor
- [ ] **TOTP re-enrollment flow** — let users reset their authenticator without losing account access

---

## 📜 License

```
MIT License

Copyright (c) 2026 BehaviorAuth

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">
  <strong>Built for AI Summit Hackathon 2026</strong><br/>
  Behavioral biometrics + TOTP = authentication that adapts to <em>you</em>.
</div>
