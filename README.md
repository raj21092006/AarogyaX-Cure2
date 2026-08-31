# 🏥 AarogyaX Cure - Next-Gen Emergency Response & Digital Healthcare Ecosystem

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.0.2-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_3.7_Flash-Google_GenAI-8E44AD?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Vector_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg?style=for-the-badge)]()

**AarogyaX Cure** is an advanced, high-performance digital healthcare platform engineered to bridge critical gaps in emergency response, hospital bed discovery, real-time blood donation matching, AI-driven medical triage, and multi-role clinical management.

---

## 🌟 Key Features & Core Ecosystem

### 1. 🎨 Brand Identity & Custom Design System
- **Official Brand Logos & Favicons**: Integrated official `favicon.png`, `favicon.ico`, and `logo.png` emblems across all navigation headers, portals, and tab titles.
- **Persistent Light / Dark Mode**: Custom CSS design tokens with midnight dark (`#090d16`) and crisp light (`#f8fafc`) themes, stored in `localStorage` (`aarogyax_theme`) with zero flash on load.

### 2. 🚨 Emergency SOS Dispatch & 5 Emergency Contacts
- **Live GPS Broadcasting**: Obtains high-accuracy GPS coordinates (`latitude`, `longitude`) via Browser Geolocation API and transmits live SOS alerts.
- **Automated Alert Routing**: Direct navigation link generator for Google Maps pre-filled into instant **WhatsApp** and **SMS** emergency dispatch channels for up to **5 Emergency Contacts**.
- **1-Click Call to Emergency Services**: Instant action buttons for 108 Ambulance Dispatch and Emergency Command Desks.

### 3. 🏥 "Hospitals Near Me" & Real-Time Bed Availability Engine
- **Geoapify Places API Integration**: Dynamically fetches real nearby hospitals (`healthcare.hospital` category) within adjustable radiuses.
- **Interactive Leaflet Vector Map**: Custom marker icons, popups, direct route directions, and distance calculations via the Haversine formula.
- **Live Proximity Filters**: Filter hospital results dynamically (**Within 3 km**, **Within 5 km**, **Within 10 km**, **All Nearby**).
- **Real-Time Bed & ER Fleet Status**: Shows available ER beds, ICU units, and standby emergency ambulances.

### 4. 🧪 Realtime Diagnostic Laboratories & Pathology Finder
- **Location-Based Pathology Discovery**: Finds accredited diagnostic centers and pathology labs using Geoapify Places API (`healthcare.clinic,healthcare`).
- **Popular Test Packages**: Instant view of diagnostic packages (*CBC Blood Count, Lipid Profile, Thyroid Profile, HbA1c, Liver Function*).
- **Home Sample Collection Badge**: Highlights labs offering doorstep sample pickup with direct contact options.

### 5. 🩸 Real-Time Blood Donor Network & Matcher
- **Cloud Firestore Live Stream (`onSnapshot`)**: Streams newly registered blood donors in real time across all active user sessions without manual refresh.
- **Direct Connect**: 1-Click direct dial (`📞 Call Donor`) and instant WhatsApp chat (`💬 WhatsApp`).
- **Donor Registration Modal**: Seamless onboarding modal enabling users to register as active blood donors with location and contact information.

### 6. 🤖 Gemini 3.7 Flash AI Health Assistant
- **Official `google-genai` SDK**: Powered by Google's latest `gemini-3.7-flash` model.
- **Symptom Analysis & First Aid**: Interactive chat providing instant initial guidance, triage advice, and educational first-aid steps.
- **Clinical Safety Guardrails**: Enforces clear disclaimers prioritizing professional medical consultation for critical symptoms.

### 7. 🔐 Multi-Role Firebase Authentication & Adaptive Portals
- **Firebase Auth (Project `data-d3a3e`)**: Supports Email/Password authentication, Google Sign-In, SMS Phone Verification, and Forgot Password credential recovery.
- **Role-Based Workflows**:
  - 👤 **Patient Portal**: Personalized dashboard for managing emergency contacts, tracking active prescriptions, viewing health records, and generating Digital Health Cards.
  - 👨‍⚕️ **Doctor Portal**: Clinical staff interface for reviewing patient assignments, analyzing symptom triage escalations, and viewing health summaries.
  - 🏥 **Hospital Admin Portal**: ER Command Center interface for updating live bed counts, managing ambulance fleets, and resolving inbound emergency SOS alerts.

### 8. 💳 Digital Health Card & Scannable QR Code
- **Generates Physical-Style Health ID**: Displays blood group, severe allergies, emergency contact details, and primary medical identification.
- **Scannable QR Code**: Embeds critical emergency medical history into a QR code for instantaneous scanning by first responders and paramedics.

### 9. 💊 Medication Reminders & Digital Health Records Vault
- **Dosage Tracker**: Automated schedule reminders for prescribed medications, dosage times, and refill alerts.
- **Health Records Vault**: Encrypted file uploads and organization for prescriptions, lab test reports, and vaccination certificates.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla CSS3 (Custom Design Tokens), ES6+ JavaScript, Leaflet.js, QRCode.js |
| **Backend API** | Python 3.11+, Flask 3.0.2, Flask-CORS 4.0.0, Werkzeug |
| **Artificial Intelligence** | Google GenAI SDK (`google-genai`), `gemini-3.7-flash` Model |
| **Database & Auth** | Cloud Firestore (`data-d3a3e`), Firebase Authentication (v10.12.0 SDK) |
| **Maps & Location** | Geoapify Places API, Geoapify Carto HD Tiles, Browser Geolocation API |
| **Hosting & Cloud** | Firebase Hosting (`firebase.json`), Cloud Firestore Security Rules (`firestore.rules`) |

---

## 📂 Project Structure

```
AarogyaX Cure/
├── backend/
│   ├── app.py                   # Flask Application Entrypoint (Port 5000)
│   ├── config.py                # App Configuration & Environment Variable Loader
│   ├── requirements.txt         # Python Backend Dependencies
│   ├── test_api.py              # Automated Unit & Integration Test Suite
│   ├── routes/                  # Modular Flask Blueprints
│   │   ├── auth.py              # User Auth & Profile Management
│   │   ├── assistant.py         # Gemini 3.7 Flash AI Chat Endpoint
│   │   ├── emergency.py         # Emergency SOS Dispatch Endpoint
│   │   ├── hospitals.py         # Geoapify Hospitals API Endpoint
│   │   ├── blood.py             # Blood Donor Network & Matcher Endpoint
│   │   ├── labs.py              # Diagnostic Laboratories Endpoint
│   │   └── records.py           # Medical Health Records Endpoint
│   └── services/                # Backend Core Services
│       ├── gemini_service.py    # Google GenAI Gemini 3.7 Flash Wrapper
│       ├── location_service.py  # Haversine Distance & Proximity Calculator
│       └── notification_service.py # SMS & WhatsApp Alert Dispatcher
├── frontend/
│   ├── favicon.png              # Brand Favicon (PNG Format)
│   ├── favicon.ico              # Browser Icon
│   ├── logo.png                 # Official Brand Emblem
│   ├── index.html               # Public Landing Page & Healthcare Showcase
│   ├── login.html               # Multi-Role Sign-In & Password Recovery Page
│   ├── signup.html              # Role Registration & Onboarding Page
│   ├── dashboard.html           # Multi-Role Adaptive Dashboard
│   ├── emergency.html           # SOS Emergency Command Center
│   ├── hospitals.html           # Interactive Hospital Finder Map & Bed Status
│   ├── labs.html                # Real-Time Diagnostic Labs & Pathology Finder
│   ├── blood.html               # Real-Time Blood Donor Network & Requests
│   ├── assistant.html           # Gemini AI Health Assistant Chat UI
│   ├── records.html             # Digital Health Records Vault
│   ├── reminders.html           # Medication Dosage Schedule Tracker
│   ├── profile.html             # Digital Health Card & Scannable QR Generator
│   ├── css/                     # Styling & Responsive Layouts
│   │   ├── style.css            # Global CSS Variables & Theme Engine
│   │   ├── dashboard.css        # Dashboard Cards, Grid & Component Styles
│   │   └── responsive.css       # Responsive Breakpoints (Mobile, Tablet, Desktop)
│   └── js/                      # Frontend Application Controllers
│       ├── theme.js             # Theme Persistence Controller (Dark/Light)
│       ├── firebase-config.js   # Firebase App & SDK Credentials Initialization
│       ├── demo-data.js         # Fallback Mock Storage & Seed Data Engine
│       ├── auth.js              # Multi-Role Auth & Firestore Sync Controller
│       ├── dashboard.js         # Adaptive Dashboard & Role Switcher Logic
│       ├── emergency.js         # Live GPS Geolocation & SOS Dispatch Logic
│       ├── hospitals.js         # Leaflet Map & Geoapify API Controller
│       ├── labs.js              # Pathology & Diagnostic Lab Controller
│       ├── blood.js              # Firestore Blood Network Controller
│       ├── assistant.js         # Gemini AI Health Chat Controller
│       ├── records.js           # Health Records Vault Controller
│       ├── reminders.js         # Medication Dosage Tracker Controller
│       └── profile.js           # Digital Health Card QR Code Controller
├── firebase.json                # Firebase Hosting Configuration
├── firestore.rules              # Cloud Firestore Security Rules
├── .env                         # Root Environment Configuration File
└── README.md                    # Comprehensive Project Documentation
```

---

## ⚡ API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User registration & role provisioning (Patient, Doctor, Admin) |
| `POST` | `/api/auth/login` | User login validation & token generation |
| `POST` | `/api/assistant/chat` | AI health prompt processing via Gemini 3.7 Flash |
| `POST` | `/api/emergency/sos` | Broadcast GPS location & send SOS alerts to emergency contacts |
| `GET` | `/api/hospitals/nearby` | Fetch nearby hospitals from Geoapify API by lat/lng |
| `GET` | `/api/blood/donors` | Query blood donors by blood group and location radius |
| `POST` | `/api/blood/register` | Register user as an active blood donor |
| `GET` | `/api/labs/nearby` | Fetch nearby diagnostic & pathology labs from Geoapify |
| `GET` | `/api/records/list` | Fetch medical records for authenticated patient |
| `POST` | `/api/records/upload` | Upload new medical document/lab report to vault |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js / npm** *(Optional, for Firebase CLI deployment)*
- **Modern Web Browser**: Google Chrome, Firefox, Microsoft Edge, or Safari

### 2. Environment Setup
Create a `.env` file in the root directory (or update the existing `.env` file):

```env
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=aarogyax-cure-super-secret-key-2026
PORT=5000
DEBUG=True
```

### 3. Backend Installation & Server Execution

```bash
# Install required Python packages
pip install -r backend/requirements.txt

# Run Flask backend server
python backend/app.py
```
*The Flask API backend will start running locally on `http://127.0.0.1:5000`.*

### 4. Running Backend Tests

Verify that all backend endpoints and services are operating correctly by executing the test suite:

```bash
python backend/test_api.py
```

### 5. Frontend Launch
You can run the frontend in any of the following ways:
- **Direct Browser Access**: Simply open `frontend/index.html` in your web browser.
- **VS Code Live Server**: Right-click `frontend/index.html` and choose **Open with Live Server**.
- **Python HTTP Server**:
  ```bash
  cd frontend
  python -m http.server 8000
  ```
  Then navigate to `http://localhost:8000` in your browser.

---

## 🔒 Security & Firestore Rules

Cloud Firestore security rules are configured in [firestore.rules](file:///d:/AarogyaX%20Cure/firestore.rules):
- **User Records**: Authenticated users can read and update their own profiles.
- **Blood Donors**: Publicly readable for fast emergency lookup; write restricted to authenticated donor owners.
- **Emergency SOS Logs**: Write access granted to active users broadcasting emergency signals.

---

## 📄 License & Credits

Developed for the **AarogyaX Cure Healthcare Ecosystem**. All rights reserved.

