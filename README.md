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

## 🎨 UI Redesign Prompt for Stitch

> **Copy the prompt below and paste it directly into Stitch to generate a world-class, production-level redesign of this Hospital AI Clinical Assistant.**

---

```
Design a premium, world-class Hospital AI Clinical Assistant web application 
called "MediAssist Pro" for Kiran Multispeciality Hospital. This is a 
desktop-first, clinical workstation UI — think Bloomberg Terminal meets 
Apple Health meets a world-class SaaS medical platform like Epic or 
Doceree, but with a modern dark/glass aesthetic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN SYSTEM & VISUAL IDENTITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLOR PALETTE (Dark Obsidian Medical Theme):
• Background Primary:   #0A0E1A (deep navy-black — main canvas)
• Background Card:      #0F1629 (slightly lighter navy for cards)
• Background Elevated:  #141B30 (panels, sidebars)
• Primary Accent:       #2563EB → #7C3AED gradient (electric blue to violet)
• Secondary Accent:     #10B981 (emerald green — success, verified, active)
• Warning Accent:       #F59E0B (amber — caution, fuzzy match)
• Danger Accent:        #EF4444 (red — errors, alerts)
• Text Primary:         #F0F4FF (off-white, high contrast)
• Text Secondary:       #8B9CC8 (muted blue-grey)
• Text Muted:           #4A5578 (very muted, labels)
• Border:               rgba(99,120,255,0.12) (subtle electric border)
• Glow Primary:         rgba(37,99,235,0.3) (blue ambient glow)

TYPOGRAPHY:
• Display/Headings: "Inter" — weight 700, 800, 900 — tight tracking
• Body: "Inter" — weight 400, 500
• Monospace (UHID, codes): "JetBrains Mono" or "Fira Code"
• Medical labels: ALL CAPS, letter-spacing: 0.15em, weight 700, size 10-11px

SHAPE LANGUAGE:
• Cards: 20-24px border-radius (modern pill corners)
• Inputs: 14px border-radius
• Buttons: 12px (primary), 999px (pills/badges)
• Micro-elements (badges, dots): full circle

GLASSMORPHISM EFFECTS:
• Sidebar: backdrop-blur(20px), background: rgba(15,22,41,0.85), border: 1px solid rgba(99,120,255,0.15)
• Cards: backdrop-blur(10px), background: rgba(20,27,48,0.9)
• Modal overlay: backdrop-blur(24px), background: rgba(10,14,26,0.7)
• Prescription card header: linear-gradient(135deg, #1d4ed8, #7c3aed) with light frosting

ANIMATIONS & MICRO-INTERACTIONS:
• All card entries: fade-in + slide-up (0→1 opacity, y: 12→0, duration: 0.35s ease-out)
• Mic button active state: pulsing radial glow rings (keyframe animation, 3 concentric pulses)
• Processing state: orbiting particle loader (3 blue dots orbiting center, not a spinner)
• Hover on list items: subtle left border appears (3px primary color), background lifts to elevated
• Prescription card: border-top glows blue-violet on hover
• Button press: scale(0.97) tactile feedback
• Sidebar item select: sliding pill indicator (not just background change)
• Status badges: shimmer effect on "processing" state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️ LAYOUT ARCHITECTURE (5-Zone Layout)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ZONE 1 — COMMAND SIDEBAR (Left, 280px fixed):
• Hospital logo area at top (pill icon + hospital name in gradient text)
• "NEW CONSULTATION" CTA button: full-width, gradient background, white text, slight glow shadow
• Section label "TODAY" with live green dot + count badge
• Consultation list items: patient name (bold white), diagnosis (muted), time (right-aligned muted)
• Active item: left 3px electric blue border + elevated dark background + name in bright white
• Bottom nav (fixed): Patient Directory | Medicine Inventory | Settings 
  — each with colored accent icon, active state with matching pill background
• Footer block: tiny "Groq Active" status pill in emerald, system version

ZONE 2 — MAIN HEADER BAR (Top strip, 64px):
• Hospital name in gradient text (blue→violet)
• Vertical divider → "AI Clinical Assistant" label in muted mono
• Right: mode badge ("GROQ ACTIVE" in emerald / "OFFLINE" in amber), settings gear icon
• Subtle bottom border: 1px rgba(99,120,255,0.15)
• Optional: live datetime display (right side, monospace)

ZONE 3 — CHAT STREAM AREA (Center, flex-1, scrollable):
• Background: deep navy (#0A0E1A) with very subtle hex/grid dot pattern overlay (5% opacity)
• Doctor bubbles (right-aligned):
  — Background: rgba(37,99,235,0.15), border: 1px solid rgba(37,99,235,0.2)
  — "Dr" avatar: gradient circle, color: blue, top-right corner no border-radius
  — Text: #CBD5E1
• AI bubbles (left-aligned):
  — Background: rgba(15,22,41,0.8) with blue-left-border (4px)
  — "AI" avatar: gradient blue-violet, glowing
  — Text: #F0F4FF, formatted with markdown-style bold
• Prescription Card (inline, full-width, inside AI thread):
  — Glassmorphism card, gradient header bar (blue→violet, 60px tall)
  — Header: "Clinical Case Report" bold white + "AUTOMATED DOCUMENTATION" label
  — Patient stats strip: 3-4 tiles (Name | UHID | Age) in frosted tile style
  — Sections in 2-column grid with colored left-accent lines:
    🔵 Clinical History (blue accent)
    🟣 Examination (violet accent)  
    🟢 Radiology (emerald accent)
    🟡 Assessment & Diagnosis (amber accent, diagnosis text extra bold + uppercase)
  — Investigations: 3-column grid (Cardiac / Laboratory / Radiology) with bullet dots
  — Prescription Table: dark table, header row gradient, alternating row slight tint
    — Medicine name: bold primary color
    — Validation badge: pill (Verified=emerald, Auto-corrected=amber, Not in DB=red)
  — Card Footer: "Export Word" + "Print PDF" buttons (ghost style) + "SYNC HISTORY" CTA

ZONE 4 — INPUT COMMAND BAR (Bottom fixed, glass panel):
• Glassmorphism container: backdrop-blur + dark bg + top border glow
• Large pill-shaped input field (full-width minus controls):
  — Dark glass background, border 1.5px rgba(99,120,255,0.2)
  — Placeholder: "Speak or type clinical notes here..."
  — When mic is LISTENING: animated neon-blue border + inner glow + waveform animation
• Right controls (inside pill, right-aligned):
  — Paperclip icon (ghost, hover: primary tint)
  — MIC BUTTON: 56px circle, gradient blue-violet
    • Idle: gradient fill + subtle glow
    • Active listening: background turns red, pulsing radial rings animation
    • Processing: spinning border gradient loader
  — SEND BUTTON: 56px circle, dark with arrow icon
• Above pill (conditional): live transcript preview text in italic muted style

ZONE 5 — ERROR TOAST (floating, top-right):
• Glassmorphism card, animated entry (slide from right)
• Red accent border-left, alert icon, dismiss X

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 PATIENT DIRECTORY VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Page header: "Patient Directory" h1 + "Clinical Database" subtitle
• 3 stat macro-tiles (Total Patients | Total Records | Active Today)
  — Glassmorphism tiles, each with gradient icon bg, large number in white, label muted
• Search bar: full-width, dark glass, animated border on focus
• Table: dark card, rounded-xl, no visible table lines (use row hover bg for separation)
  — Header: muted uppercase labels, no bg
  — Rows: avatar initial circle (gradient on hover), name+age/gender, UHID mono badge,
    record count with dot indicator, last visit date, "View Rx →" button
  — Row hover: slight elevated bg shift + left glow border appears
• Empty state: large rounded icon, "No patients found" heading, muted description

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💊 MEDICINE INVENTORY VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Header: pill icon in emerald gradient square, title, "LIVE DATABASE SYNC" indicator
• Search + "New Medicine" button (header right)
• Add form (animated expand): glass card with underline input + add/cancel buttons
• Inventory list: dark card, each medicine row:
  — Pill icon (muted emerald, glows on hover)
  — Medicine name (bold white)
  — Hover reveals edit/delete actions (opacity 0 → 1 transition)
  — Edit mode: borders glow emerald
• Count badge: "250 ITEMS" pill in muted style
• Empty state: large pill icon, suggestion to add medicine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ SETTINGS VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• 3 sections in a max-width-3xl centered column:

Section 1 — Hospital Profile (glass card):
  — Blue hospital icon square
  — "Institutional Name" label + icon-prefixed input (dark glass style)

Section 2 — AI Integration (glass card):
  — Shield/AI icon square in primary gradient
  — "Groq Cloud API Key" password input with show/hide toggle
  — "Get Free API Key →" text link (top-right of section)
  — Status pill: "CONNECTED" (emerald) or "NOT CONFIGURED" (amber)

Section 3 — Danger Zone (red-tinted glass card):
  — Red trash icon, red section heading
  — Description text
  — "FACTORY RESET" button: dark red bg, white text, hover brightens

• Sticky Save bar (fixed bottom of scroll area): 
  — Glass background, "SAVE CHANGES" gradient CTA button
  — On save: transitions to "✓ UPDATED!" emerald state

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 API KEY MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Center-screen modal with deep backdrop blur + dark overlay
• Glassmorphism card: rounded-2xl, elevated shadow + glow
• Header: key icon in gradient square + "Groq API Settings" title + close X
• Info banner: blue-tinted glass, shield icon, text about local storage + link
• Password input: dark glass, monospace font, show/hide toggle
• Error text (conditional): muted red italic
• Actions: Cancel (ghost) + "Save Groq Key" (gradient CTA)
• Footer: tiny italic "Offline fallback will be used if key is missing"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌊 SPECIAL EFFECTS & POLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Subtle animated dot-grid pattern on chat background (CSS radial-gradient, very low opacity)
• Gradient text for hospital name (background-clip: text, gradient blue→violet)
• Subtle horizontal scanline effect on header (very low opacity stripe pattern)
• ALL interactive elements must have :focus-visible styles (keyboard nav)
• Smooth scroll-bar styling (thin, colored track)
• Card shadows: 0 4px 24px rgba(37,99,235,0.15) blue ambient glow
• Sidebar gradient from #141B30 top to slightly darker at bottom
• "AI" avatar: gradient background with subtle inner glow pulse when processing
• Prescription card print styles: force white bg, hide all UI chrome, show only clinical content

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 DIMENSIONS & SPACING SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Base spacing unit: 4px
• Padding scale: 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px
• Sidebar width: 280px (fixed, desktop)
• Header height: 64px
• Input bar height: 88px (with inner padding)
• Prescription card: max-width 900px, centered in chat
• Directory table: full-width minus padding
• Settings max-width: 768px centered
• Mobile breakpoint: 1024px (sidebar collapses)

Generate all screens: 
1. Chat Interface (default view) — with a sample prescription card visible
2. Patient Directory
3. Medicine Inventory  
4. Settings Page
5. API Key Modal (overlay state)

Make this feel like a premium $500/month SaaS product. Every pixel 
should communicate clinical precision, data trustworthiness, and 
doctor-grade professionalism.
```

---

## 📌 Notes

- All data is **client-side only** — no server, no database, no cloud storage
- The Groq API key is stored in `localStorage` — remind users this is their own browser
- The offline parser is a robust fallback but Groq AI provides far superior accuracy
- The medicine database can be expanded by adding entries to `src/data/medicines.js`
- For production deployment, consider adding HTTPS + CSP headers for security

---

*Built with ❤️ for clinical excellence — Hospital AI Team*
