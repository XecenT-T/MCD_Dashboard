# 🏙️ MCD Portal

> **Next-Gen Smart Workforce Management for Municipal Corporations**

![Status](https://img.shields.io/badge/status-Active-success.svg)
![Stack](https://img.shields.io/badge/stack-MERN-informational.svg)

**CivicForce AI** is a comprehensive, intelligent dashboard designed to modernize workforce management for municipal bodies. By leveraging biometric authentication, geo-spatial intelligence, and AI-powered support, we tackle the challenges of ghost workers, inefficient deployment, and grievance redressal in the public sector.

---

## ✨ Key Features

### 🛡️ Secure & Smart Attendance
- **Biometric Verification:** Integrated `face-api.js` for fraud-proof, client-side face recognition.
- **Geo-Fencing:** Ensures workers are physically present at their assigned wards.

### 📊 Real-Time Analytics Dashboard
- **Live Insights:** Track attendance trends, payroll status, and grievance resolution rates.
- **Interactive Visualizations:** Powered by `Recharts` for actionable data interpretation.

### 🗺️ Geo-Spatial Intelligence
- **Deployment Maps:** Visualize workforce density against reported civic issues using `Leaflet`.
- **Live Tracking:** Monitor departmental coverage in real-time.

### 🤖 AI-Powered Support
- **Gemini Chatbot:** A 24/7 AI assistant built with Google Gemini to help workers checks payroll, file grievances, and answer queries in their native language.
- **Multi-Language Support:** Inclusive design for a diverse workforce.

### 📝 Grievance & Payroll Management
- **Digital Redressal:** Transparent filing and tracking of worker complaints.
- **Automated Payroll:** Seamless calculation and history tracking for administrative efficiency.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 + Vite (TypeScript)
- **Styling:** Tailwind CSS v4
- **Maps:** Leaflet & React-Leaflet
- **AI/ML:** Face-API.js
- **State/Context:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Caching:** Redis
- **AI Engine:** Google Gemini Generative AI
- **Utilities:** PDFKit (Reports), Multer (Uploads), JWT (Auth)

---
## 📂 Folder Structure

```
MCD_Dashboard/
├── backend/                # Node.js API Server
│   ├── controllers/        # Request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & error handling
│   └── index.js            # Entry point
│
├── frontend/               # Frontend Container
│   └── frontend/           # React Application (Vite)
│       ├── public/         # Static assets
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── pages/      # Route pages (Dashboard, Login, etc.)
│       │   ├── App.jsx     # Main App component
│       │   └── main.tsx    # Entry point
│       └── vite.config.ts  # Vite configuration
│
└── README.md               # Project Documentation
```
---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)
- Redis Server

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/MCD_Dashboard.git
    cd MCD_Dashboard
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    # Create a .env file with your credentials (MONGO_URI, GEMINI_API_KEY, etc.)
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend/frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    Open your browser and navigate to `http://localhost:5173`

---

## 📸 Screenshots

![WhatsApp Image 2026-01-12 at 1 04 34 AM](https://github.com/user-attachments/assets/5889cc05-0257-401e-b195-a385cd66e859)
![WhatsApp Image 2026-01-12 at 1 04 32 AM (1)](https://github.com/user-attachments/assets/56f160b5-49f1-45fd-9e7c-d6b8b0b2d538)
![WhatsApp Image 2026-01-12 at 1 04 32 AM](https://github.com/user-attachments/assets/0589828f-64bc-46df-b814-c4ddaa51f9e2)
![WhatsApp Image 2026-01-12 at 1 04 31 AM](https://github.com/user-attachments/assets/3cf22964-1c0e-495e-83fd-9af9d9c0e4ad)
<img width="1896" height="906" alt="Screenshot 2026-01-12 000314" src="https://github.com/user-attachments/assets/bb118fef-e2aa-4f81-bbe3-431794b75ba1" />
<img width="1919" height="907" alt="Screenshot 2026-01-12 000331" src="https://github.com/user-attachments/assets/de9327f2-39b8-4003-b134-7aecdf62cfe8" />


---

## 🏆 Hack4Delhi 2026

A civic-tech solution developed for Hack4Delhi 2026, a nationwide hackathon organized by IEEE NSUT and HN, aimed at building technology-driven solutions for governance and public systems.
