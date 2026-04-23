# 🏥 Hospital AI Clinical Assistant

> **Production-grade, Groq-powered voice-to-prescription intelligence platform for multispeciality hospitals.**

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?logo=vite)](https://vitejs.dev)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.1-F55036?logo=groq)](https://groq.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer--Motion-11-FF0055)](https://www.framer.com/motion)

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Core Features](#-core-features)
3. [Tech Stack](#-tech-stack)
4. [Project Architecture](#-project-architecture)
5. [Module Documentation](#-module-documentation)
6. [AI & Intelligence Layer](#-ai--intelligence-layer)
7. [Data Models](#-data-models)
8. [Setup & Configuration](#-setup--configuration)
9. [Environment Variables](#-environment-variables)
10. [Usage Guide](#-usage-guide)
11. [UI Redesign Prompt (Stitch)](#-ui-redesign-prompt-for-stitch)

---

## 🌟 Overview

**Hospital AI Clinical Assistant** is a fully browser-based, zero-backend clinical documentation system designed for busy hospital doctors. It leverages **Groq's LLaMA 3.1 8B Instant** model to convert raw spoken doctor notes into structured, printable prescriptions — in real time.

The system works in two modes:
- **Online Mode (Groq AI):** Doctor speaks → Browser STT captures → Groq AI structures → Prescription generated
- **Offline Mode (Local Parser):** Zero API dependency, regex+NLP-based offline fallback with 250-medicine database

All data is stored in **localStorage** (HIPAA-style client-only, no server uploads).

---

## ✅ Core Features

### 1. 🎤 Voice-Activated Clinical Documentation
- Uses **Web Speech API** (browser-native, no external SDK)
- Language set to `en-IN` for Indian medical terminology
- Continuous listening with **3-second silence detection** auto-stop
- Real-time interim transcript display while speaking
- Stop/restart toggle with status indicators (idle / listening / processing)

### 2. 🤖 Groq AI Prescription Extraction
- Model: `llama-3.1-8b-instant` (ultra-fast inference)
- Converts unstructured voice transcript → full structured clinical JSON
- Extracts: Patient Name, UHID, Age, Gender, Chief Complaint, Surgical History, Abdomen Examination, Palpable Abnormality, Radiology Impression, Provisional Diagnosis, Investigations Advised (Cardiac/Lab/Radiology), Management Plan, Medicines
- Handles phonetic errors (e.g., "Azy" → "Azithromycin", "Dolo" → "Dolo 650")
- Response format enforced as `json_object` for zero-parse-failure
- Temperature: `0.1` for maximum clinical determinism

### 3. 🧬 Medicine Validation Engine (`medicineValidator.js`)
- **250-medicine database** spanning all clinical categories
- 3-tier validation pipeline:
  1. **Exact match** (case-insensitive)
  2. **Contains match** (partial name match)
  3. **Fuzzy match** via Levenshtein distance (≤4 edits threshold)
- Each medicine gets a `validation` badge: `✅ Verified` / `⚠️ Auto-corrected` / `❌ Not in DB`

### 4. 📋 Clinical Prescription Card (`PrescriptionCard.jsx`)
- Rich structured UI card with sections:
  - Patient info (Name, UHID, Age)
  - Clinical History (Chief Complaint, Surgical History)
  - Examination (Abdomen, Palpable Abnormality)
  - Radiology (Findings / Impression)
  - Assessment (Diagnosis, Management Plan)
  - Investigations (Cardiac / Lab / Radiology)  
  - Prescription Table (Medicine | Dosage | Frequency | Duration)
- **Inline Edit Mode** — doctor can edit any field directly in the card
- **Export to Word (.doc)** — generates professional letterhead HTML → `.doc` via Blob API
- **Print to PDF** — browser print dialog with print-optimized CSS

### 5. 💬 Chat Interface (`ChatInterface.jsx`)
- Dual-bubble chat (Doctor bubble right, AI bubble left)
- Prescription cards rendered inline inside AI message thread
- Supports **text input** (keyboard) and **voice input** (mic button)
- File attachment button (UI ready, extendable)
- Error display bar with auto-dismiss
- Smooth scroll-to-latest using `useRef`
- Animated typing indicator while Groq processes

### 6. 🗂️ Patient Directory (`PatientDirectory.jsx`)
- Aggregates all consultations into unique patient records (deduplicated by UHID or name)  
- Shows: Total Patients, Total Records, Active Today (live stat cards)
- Searchable by patient name or UHID
- Click "View Rx" → jumps directly to that consultation's chat

### 7. 💊 Medicine Inventory Manager (`MedicineInventory.jsx`)
- Full CRUD on the medicine database:
  - **Add** new medicine formulation
  - **Inline Edit** existing medicine name
  - **Delete** with confirmation
- Real-time search filter (250+ items)
- Changes persist to `localStorage`
- Toast notifications for success/error states

### 8. ⚙️ Settings Panel (`Settings.jsx`)
- **Hospital Profile:** Edit institutional name (reflected everywhere in the UI)
- **AI Integration:** Securely paste/update Groq API key (masked password input)
- **Danger Zone:** Factory reset — clears all localStorage consultation data
- Sticky Save bar at the bottom

### 9. 🔑 API Key Modal (`ApiKeyModal.jsx`)
- Accessible from the Chat header Settings icon
- Key format validation (`gsk_` prefix check)
- Key stored in `localStorage` only (never sent to any server except Groq's own endpoint)
- Show/hide password toggle
- Links directly to `console.groq.com/keys`

### 10. 🗃️ Consultation History & Persistence
- All consultations stored in `localStorage` as JSON (`hospital_consultations`)
- Sidebar groups consultations as **Today** vs **Previous**
- Click any consultation → restores full chat + prescriptions
- New Consultation button starts a fresh session
- Hospital name and API key also persist across page reloads

### 11. 📄 Offline Prescription Parser (`prescriptionParser.js`)
- Zero-dependency fallback when no API key is configured
- Extracts via regex patterns:
  - Patient name (supports Mr/Mrs/Miss/Dr prefixes)
  - UHID from "UHID:", "Patient ID:", "PID:"
  - Age from "age 45", "45 years old"
  - Gender from gendered pronouns & keywords
  - Symptoms from 35+ keyword dictionary
  - Medicines directly from 250-medicine database scan
  - Dosage (mg/ml/mcg/tab/cap), Frequency, Duration
- `generateDocument()` creates plain-text formatted prescription

### 12. 📱 Responsive Layout
- Sidebar hidden on mobile, slides in via `transform/translate`
- Mobile hamburger menu toggles sidebar
- Backdrop blur overlay on mobile sidebar open
- All views (Chat, Directory, Inventory, Settings) fully mobile-responsive

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | React 18.2 + Vite 5.2 | SPA, fast HMR dev |
| Styling | TailwindCSS 3.4 | Utility-first responsive design |
| Animation | Framer Motion 11 | Page transitions, card animations |
| Icons | Lucide React | Consistent medical + UI icons |
| AI Engine | Groq Cloud (LLaMA 3.1 8B) | Voice→JSON prescription extraction |
| STT | Web Speech API (browser native) | Real-time voice transcription |
| Storage | localStorage | Client-only data persistence |
| Build | Vite + @vitejs/plugin-react | Fast build + JSX transform |
| Linting | ESLint + react-hooks plugin | Code quality |

---

## 📁 Project Architecture

```
hospital-assistant/
├── src/
│   ├── App.jsx                    # Root — state, routing, persistence
│   ├── main.jsx                   # React DOM entry
│   ├── index.css                  # Global styles + Tailwind directives
│   │
│   ├── components/
│   │   ├── Sidebar.jsx            # Left nav: consultations + module links
│   │   ├── ChatInterface.jsx      # Main doctor-AI chat + voice input
│   │   ├── PrescriptionCard.jsx   # Rich clinical report card + export
│   │   ├── PatientDirectory.jsx   # Patient list with stats + search
│   │   ├── MedicineInventory.jsx  # CRUD medicine database manager
│   │   ├── Settings.jsx           # Hospital config + API key + danger zone
│   │   └── ApiKeyModal.jsx        # Groq key input modal
│   │
│   ├── utils/
│   │   ├── groqApi.js             # Groq API calls (extract + document gen)
│   │   ├── medicineValidator.js   # 3-tier fuzzy medicine validation
│   │   └── prescriptionParser.js  # Offline regex-based transcript parser
│   │
│   └── data/
│       └── medicines.js           # 250-medicine curated database
│
├── public/
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 📦 Module Documentation

### `App.jsx` — State Orchestrator
- Manages top-level state: `apiKey`, `hospitalInfo`, `medicines`, `consultations`, `currentConsultationId`, `view`
- All state persists to `localStorage` via `useEffect`
- Routes between 4 views: `chat`, `directory`, `medicines`, `settings`
- Passes `onUpdateConsultation` handler to ChatInterface for history sync

### `ChatInterface.jsx` — Core Interaction Engine
- **State:** `micStatus`, `transcript`, `inputText`, `prescriptions`, `messages`, `metadata`, `errorMsg`
- Web Speech API lifecycle: `startListening()` → `onresult` (interim) → 3s silence → `stopListening()` → `processAndSend()`
- `processAndSend(text)`:
  1. Appends doctor message to thread
  2. Calls `extractPrescriptionFromSpeech()` (Groq) or `parseTranscript()` (offline)
  3. Appends AI reply + `PrescriptionCard` to thread
  4. Updates metadata (patient name, diagnosis)
  5. Syncs back to history via `onUpdateHistory()`

### `groqApi.js` — AI Communication Layer
- `groqRequest(apiKey, system, user)` — generic Groq fetch with JSON response format
- `extractPrescriptionFromSpeech(transcript, apiKey, medicineList)` — primary extraction
  - Injects hospital medicine list into system prompt for phonetic correction
  - Validates returned medicines via `validateMedicines()`
- `generatePrescriptionDocument(structuredData, hospitalName, apiKey)` — formats plain text document

### `medicineValidator.js` — Fuzzy Match Engine
- `levenshtein(a, b)` — O(m×n) DP string distance
- `validateMedicine(input)` — 3-tier: exact → contains → Levenshtein (≤4)
- `validateMedicines(array)` — maps validation over AI medicine array

### `prescriptionParser.js` — Zero-Dependency Fallback
- `parseTranscript(transcript)` — full offline extraction pipeline
- `generateDocument(data, hospitalName)` — plain text prescription formatter

---

## 🧠 AI & Intelligence Layer

### Groq API Configuration
```
Endpoint : https://api.groq.com/openai/v1/chat/completions
Model    : llama-3.1-8b-instant
Temp     : 0.1 (deterministic for medical accuracy)
Format   : json_object (guaranteed JSON output)
```

### Prompt Engineering (System)
The system prompt instructs the model to:
1. Output ONLY valid JSON (no markdown, no prose)
2. Use `null` for missing fields
3. Fix phonetic errors by mapping to the injected medicine list
4. Extract comprehensive clinical fields from single voice input

### Output JSON Schema
```json
{
  "patient_name": "string | null",
  "age": "number | null",
  "gender": "string | null",
  "uhid": "string | null",
  "chief_complaint": "string",
  "past_history": {
    "surgical_history": "string",
    "duration": "string"
  },
  "clinical_examination": {
    "abdomen": "string",
    "palpable_abnormality": "string"
  },
  "radiology": {
    "findings": "string",
    "impression": "string"
  },
  "provisional_diagnosis": "string",
  "investigations_advised": {
    "cardiac": ["string"],
    "laboratory": ["string"],
    "radiology": ["string"]
  },
  "plan": "string",
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string"
    }
  ]
}
```

---

## 📊 Data Models

### Consultation Object (localStorage)
```js
{
  id: 1712345678901,          // timestamp as unique ID
  patient_name: "Ramesh Patel",
  diagnosis: "Acute Appendicitis",
  messages: [
    { role: "doctor" | "ai", content: "...", type?: "prescription", prescriptionData?: {} }
  ],
  prescriptions: [
    { id: 1712345678902, data: { ...prescriptionJSON } }
  ]
}
```

### Medicine Validation Object
```js
{
  name: "Dolo",                        // raw AI output
  dosage: "650mg",
  frequency: "Twice Daily",
  duration: "5 days",
  validation: {
    matched: "Dolo 650",               // corrected name from DB
    status: "fuzzy",                   // valid | fuzzy | invalid
    original: "Dolo"
  }
}
```

---

## 🚀 Setup & Configuration

### Prerequisites
- Node.js 18+
- npm or yarn
- Groq API key (free at [console.groq.com/keys](https://console.groq.com/keys))

### Installation
```bash
# Clone / open project
cd hospital-assistant

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

### First Run
1. App runs at `http://localhost:5173`
2. Click the **⚙️ Settings** icon in the chat header
3. Enter your Groq API key (`gsk_...`)
4. Start speaking! Press the **🎤 microphone** button

---

## 🔐 Environment Variables

Create a `.env` file in the project root (optional):

```env
# If set, this key is pre-loaded (user can still override via UI)
VITE_GROQ_API_KEY=gsk_your_key_here
```

> **Note:** Without a key, the app automatically falls back to the offline regex parser. No functionality is broken — the offline mode still extracts medicines, patient details, and generates prescriptions.

---

## 📖 Usage Guide

### Starting a Consultation
1. Click **"New Consultation"** in the sidebar
2. Press the **🎤 microphone button** (turns red when listening)
3. Speak naturally: *"Patient Ramesh Patel, age 58, male, UHID 12345. Chief complaint chest pain for 3 days. Past surgical history appendectomy 2 years ago. Abdomen soft. No palpable abnormality. USG shows impression of kidney stone. Provisional diagnosis acute cholecystitis. Advise CBC, LFT, USG abdomen. Prescribe Pantoprazole 40mg once daily for 7 days, Buscopan twice daily for 5 days."*
4. Stop talking → 3-second silence auto-submits
5. Prescription card appears instantly

### Editing a Prescription
- Click **"Edit Report"** on any prescription card
- All fields become editable inline
- Click "Finish Editing" to save

### Exporting
- **Word (.doc):** Generates professional letterhead document
- **Print PDF:** Browser print dialog with clinic-ready layout

### Managing Medicines
- Go to **Medicine Inventory** from the sidebar
- Search, add, edit, or remove medicines
- Changes immediately affect AI phonetic correction

---

---

## 📌 Notes

- All data is **client-side only** — no server, no database, no cloud storage
- The Groq API key is stored in `localStorage` — remind users this is their own browser
- The offline parser is a robust fallback but Groq AI provides far superior accuracy
- The medicine database can be expanded by adding entries to `src/data/medicines.js`
- For production deployment, consider adding HTTPS + CSP headers for security

---

*Built with ❤️ for clinical excellence*
