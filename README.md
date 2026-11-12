# CareTrack — Patient Monitoring & Quarantine Facility Management System

**CareTrack** is a high-reliability, responsive web application designed for quarantine facilities to monitor patients, daily temperature records, clinical physician rounds, recovery tracking, room allocation, discharge authorizations, and hospital performance benchmarks.

Built as part of the **Technical Product Manager assessment for FactWise**.

---

## 🌟 Key Features & Business Rules Implemented

1. **Hospital Capacity Enforcement (74-Bed Limit)**:
   - Maximum capacity of 74 active patients.
   - Live room occupancy tracking (`Occupied / 74 Beds`, Available count).
   - System strictly prevents admitting new patients when all 74 beds are occupied.
   - Discharged and deceased patients immediately vacate and release their room back to the available pool.

2. **Once-Daily Nurse Temperature Protocol**:
   - Every active patient must have body temperature recorded in Celsius (°C) once per calendar day.
   - **Duplicate Entry Prevention**: System strictly prevents duplicate temperature logs for the same patient on the same calendar day with clear alerts.
   - Temperature history with fever/afebrile indicators, nurse timestamps, and clinical notes.

3. **Physician Daily Visit Protocol**:
   - Every active patient receives one daily doctor visit.
   - **Strict Order Enforcement**: Doctor visits are **blocked** until today's temperature is recorded by nursing staff.
   - **Duplicate Visit Prevention**: Only 1 physician visit allowed per patient per calendar day.
   - Complete clinical notes and prescription/treatment documentation.

4. **3-Day Consecutive Fever-Free Recovery & Discharge Rule**:
   - Patients qualify for recovery review **only after 3 complete consecutive fever-free days** (tracked as `0/3`, `1/3`, `2/3`, `3/3`).
   - **Fever Reset**: Any fever spike immediately resets the recovery counter to `0/3`.
   - **Continuity Protection**: A missing temperature record between days breaks consecutive continuity.
   - **Configurable Fever Threshold**: Pyrexia cutoff is dynamically configurable (default `37.5°C`, adjustable to `37.2°C`, `37.8°C`, `38.0°C`, etc.) in Facility Settings to adapt to facility medical protocols.

5. **Two-Stage Discharge Workflow**:
   - **Stage 1 (Doctor)**: Attending physician verifies 3 consecutive fever-free days and submits an official Discharge Recommendation.
   - **Stage 2 (Admin)**: Facility Administrator reviews history, authorizes final discharge, releases the patient's room, and transitions them into the Survivor cohort.
   - Administrative discharge is blocked without prior physician clearance.

6. **Hospital Mortality & Survival Benchmarks**:
   - **Mortality Benchmark**: Tracked against the **15% regulatory benchmark**.
   - **Survival Benchmark**: Tracked against the **85% target benchmark**.
   - **Critical Warning**: Prominent facility alert banner triggers automatically if mortality exceeds 15.0%.
   - **Cohort Analysis**: Supports both "All Admitted Patients" and "Resolved Cases (Discharged + Deceased)".

7. **Multi-Day Workflow Simulator (Evaluator Super-Feature)**:
   - Dedicated `+1 Day` simulation control in the top navigation bar allows reviewers to simulate tomorrow's shift in 1 click to test 3-day recovery transitions without waiting real days!
   - Reset Demo Data button restores clean baseline test data at any time.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Language**: JavaScript (ES Modules)
- **Styling**: Healthcare SaaS Design System (`src/styles/main.css`) using CSS Custom Properties, Plus Jakarta Sans typography, and clean status badges
- **Icons**: Lucide React (`lucide-react`)
- **State & Storage**: React Context + `localStorage` for persistent offline evaluation
- **Deployment**: Fully optimized for Vercel SPA deployment (`vercel.json`)

---

## 🚀 How to Run the Application Locally

### Prerequisites
- Node.js (v18+ recommended, tested on Node v24)
- npm (v9+)

### Installation & Launch

```bash
# 1. Clone or navigate to the project root directory
cd Factwise_Assignment

# 2. Install dependencies (if not already installed)
npm install

# 3. Launch local development server
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

### Running Automated Business Logic Tests

We have included a dedicated verification test suite testing all 16 clinical business rules:

```bash
node test/verify_business_rules.js
```

---

## 👥 Demo User Personas & Login Instructions

Click **"Switch Role"** in the top navigation header or use the **1-Click Demo Access buttons** on the Sign In screen:

| Role | Persona | Key Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Nurse** | Clara Vance (Duty Nurse) | • View active bed census & pending temperature queue.<br>• Record daily temperatures in °C.<br>• View vital charts.<br>• Blocked from duplicate daily entries. |
| **Doctor** | Dr. Marcus Wells (Chief of Quarantine) | • Conduct daily clinical rounds.<br>• Add medical observations & treatment notes.<br>• Blocked if nurse has not logged today's temp.<br>• Clears patients with 3/3 fever-free days by recommending discharge. |
| **Admin** | Sarah Connor (Facility Administrator) | • Overall facility KPI dashboard & room allocation.<br>• Register new patients (enforces 74-bed capacity).<br>• Finalize discharge authorizations & release rooms.<br>• Log official clinical demises.<br>• Monitor 15% mortality and 85% survival benchmarks. |

---

## 🧪 Quick Evaluation Walkthrough (3 Minutes)

Here is how you can test each requirement immediately:

1. **Test Nurse Temperature Logging & Duplicate Prevention**:
   - Switch role to **Nurse**.
   - Notice **Sarah Jenkins** (Room 101) has `Temp Pending Today`.
   - Click **"Log Temp"** & enter `36.8` °C. Click Save.
   - Status immediately updates to `Normal / Afebrile` and Sarah is now marked `Ready for Doctor Visit`.
   - Try logging another temperature for Sarah for today: The system alerts you that an official entry already exists and blocks duplicate submission.

2. **Test Doctor Visit Dependency on Nurse Temperature**:
   - Switch role to **Doctor**.
   - Look at **Michael Chang** (Room 108, pending temperature): Try conducting a visit. The modal alerts that a nurse must record temperature first and disables completion.
   - Look at **David Kim** (Room 102, temp recorded today): Click **"Conduct Visit"**, enter observations, and click **"Complete Daily Visit"**.

3. **Test 3-Day Fever-Free Recovery & Doctor Recommendation**:
   - Patient **Maria Santos** (Room 105) currently has 3/3 consecutive fever-free days recorded.
   - In Doctor view, click **"Recommend"**.
   - Review her verified 3-day history and click **"Confirm Discharge Recommendation"**.

4. **Test Admin Discharge Authorization & Room Release**:
   - Switch role to **Admin**.
   - Go to **Discharge Queue** (or see Robert Taylor / Maria Santos).
   - Click **"Authorize Discharge & Release Room"**.
   - Observe that the room is immediately released, available rooms increase by 1, and the patient is recorded as a Survivor!

5. **Test 74-Bed Capacity Limit**:
   - In Admin view, click **"Admit Patient"**.
   - Observe the live room occupancy (`X / 74 Beds`). Only unoccupied rooms (101-174) appear in the room assignment dropdown.

6. **Test 15% Mortality Benchmark Alert**:
   - Go to **Hospital Reports**.
   - Review the Mortality Rate vs 15% Benchmark and Survival Rate vs 85% Benchmark visual meters.
   - If mortality exceeds 15%, a high-visibility warning banner is prominently rendered.

7. **Test Configurable Fever Threshold**:
   - Click the **"Fever Threshold: ≥ 37.5°C"** button in the header.
   - Adjust the threshold to `37.2°C` or `38.0°C` and observe instant recalculation of patient fever statuses and streaks.

---

## 🚢 Production Build & Vercel Deployment Steps

### 1. Production Build Test

```bash
npm run build
```
The output directory will be `dist/`.

### 2. Deploying to Vercel

#### Option A: Via Vercel CLI
```bash
# Install Vercel CLI globally (if needed)
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Via GitHub & Vercel Dashboard
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the repository.
4. Vercel will automatically detect the settings from `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. The application is live with complete client-side routing support!

---

## 📁 Project File Structure

```
Factwise_Assignment/
├── index.html                           # App entry point with medical metadata
├── package.json                         # Dependencies (React 19, Vite 8, Lucide React)
├── vercel.json                          # Vercel SPA deployment configuration
├── vite.config.js                       # Vite configuration
├── README.md                            # Complete setup & assessment documentation
├── test/
│   └── verify_business_rules.js         # Automated test script for all 16 business rules
└── src/
    ├── main.jsx                         # React root entry point
    ├── App.jsx                          # Root component with routing and modal management
    ├── styles/
    │   └── main.css                     # Healthcare SaaS design system & theme
    ├── context/
    │   ├── AppContext.jsx               # Core application state, actions, & validation
    │   └── initialData.js               # 10 realistic demo patients across all states
    ├── utils/
    │   ├── calculations.js              # Fever check, 3-day recovery streak, & hospital metrics
    │   └── dateUtils.js                 # ISO date handling & multi-day simulation offsets
    └── components/
        ├── auth/
        │   └── LoginScreen.jsx          # Professional login & 1-click demo role switcher
        ├── common/
        │   ├── Header.jsx               # Top bar with capacity, date simulation, & role switcher
        │   ├── Sidebar.jsx              # Navigation with live queue badge counters
        │   ├── MetricCard.jsx           # Reusable KPI card with status indicators
        │   └── Toast.jsx                # Toast alerts for feedback and validation errors
        ├── dashboards/
        │   ├── AdminDashboard.jsx       # 74-bed capacity, mortality alert, & patient directory
        │   ├── NurseDashboard.jsx       # Temperature queue & shift tracking
        │   ├── DoctorDashboard.jsx      # Daily rounds, vital review, & recovery queue
        │   └── DischargeManagement.jsx  # Admin discharge authorizations & room release
        ├── patients/
        │   ├── PatientList.jsx          # Filterable & searchable patient table with actions
        │   ├── PatientDetailsModal.jsx  # Full patient chart, vitals timeline, & visit notes
        │   ├── AddPatientModal.jsx      # Patient registration with 74-bed capacity guard
        │   ├── RecordTemperatureModal.jsx# Nurse temperature recording with duplicate lock
        │   ├── RecordVisitModal.jsx     # Doctor visit recording with temp prerequisite lock
        │   ├── RecommendDischargeModal.jsx # Physician 3-day fever-free discharge clearance
        │   └── RecordDeathModal.jsx     # Demise registration with room release
        ├── reports/
        │   └── HospitalReports.jsx      # Mortality/survival benchmark charts & cohort analytics
        └── settings/
            └── FacilitySettingsModal.jsx# Configurable fever threshold & demo data reset
```

---

## 🛡️ Limitations & Assumptions

- **Persistent Demonstration Storage**: Application state is stored in browser `localStorage`. No remote server or database setup is required.
- **Single Quarantine Facility**: The model assumes a single quarantine hospital campus with maximum 74-bed capacity (Rooms 101 through 174).
- **Client-Side Simulation**: Date simulation allows forward and backward operational testing without altering user device clocks.
