# Bhooraksha — AI Landslide Early Warning & Evacuation Intelligence Platform

> **Smart India Hackathon (SIH) 2024 — Disaster Management & AI**

A full-stack AI-powered platform for real-time landslide risk prediction, 3D terrain visualization, safe evacuation routing, and citizen hazard reporting across Northeast India.

## 🚀 Live Features

| Feature | Description |
|---|---|
| 🗺️ **Live 2D GIS Dashboard** | Real-time Leaflet map with 18 IoT sensor node markers color-coded by landslide risk |
| 🏔️ **3D Blender-Style Terrain** | Three.js procedural DEM with Topo, Clay, Slope Hazard & Wireframe shader modes |
| 🛣️ **AI Safe Routing Engine** | Dynamic green corridor rerouting avoiding blocked ghat cuttings across 5 major NE India highway corridors |
| 📋 **Citizen Hazard Reports** | Crowdsourced incident portal for commuters, residents, and volunteers to report landslides and rockfalls |
| 📊 **Project Overview** | System architecture, AI risk sandbox, 18-station sensor map, and NDMA protocol matrix |
| ⚡ **Live WebSocket Alerts** | Real-time emergency broadcasts when risk score exceeds threshold |
| 🌧️ **Rainfall Event Simulation** | Interactive simulator using a calibrated Random Forest ML model |

## 🏗️ Tech Stack

### Frontend
- **React 19** + **Vite 8** + **TailwindCSS v4**
- **Three.js** — Blender-style 3D DEM mountain range rendering
- **Leaflet + React-Leaflet** — 2D interactive GIS mapping
- **Recharts** — Risk trend & sensor data charts
- **Lucide React** — Icon system

### Backend
- **FastAPI** (Python) — Async REST API + WebSocket real-time alerts
- **scikit-learn** — Random Forest classifier for landslide probability
- **Pandas / NumPy** — Hydrological data processing
- **Joblib** — Model serialization

## 📦 Setup & Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

App opens at **http://localhost:5173/**

## 🗺️ Covered Highway Corridors (Safe Routing)

| Corridor | Danger Route | Safe Green Corridor |
|---|---|---|
| Guwahati ➔ Shillong | NH-6 GS Road Scarp | Bhoirymbong Ridge Bypass |
| Dimapur ➔ Kohima | NH-29 Dzüdza Sinking Zone | Niuland–Zhadima Ridge Link |
| Siliguri ➔ Gangtok | NH-10 Teesta Canyon | Gorubathan–Lava–Rhenock Route |
| Silchar ➔ Aizawl | NH-306 Kolasib Hill Saddle | Bilkhawthlir–Darlawn Ridge |
| Itanagar ➔ Pasighat | NH-415 Nirjuli Hill Cut | Trans-Arunachal Foothill Express |

## 🤖 AI Risk Model

- **Features**: Rainfall Intensity (mm/hr), Duration (hrs), Static Terrain Susceptibility (%)
- **Model**: Random Forest Classifier trained on GSI NE India landslide inventory data
- **Output**: Probability of slope failure → Dynamic Risk Score (0–100) → Risk Band (Low / Moderate / High / Very High)

## 🛡️ NDMA Warning Protocol Integration

| Risk Band | Score | Response |
|---|---|---|
| 🔴 Very High (Red Alert) | 75–100 | Immediate evacuation, total highway closure, NDRF deployment |
| 🟠 High (Orange Alert) | 50–74 | Heavy vehicle diversion, BRO patrol activation |
| 🟡 Moderate (Yellow Watch) | 25–49 | Increased sensor polling, PWD drainage inspection |
| 🟢 Low (Green Normal) | 0–24 | Routine monitoring, normal traffic |

## 📡 Sensor Network — 18 IoT Monitoring Stations

Across: **Nagaland, Meghalaya, Mizoram, Sikkim, Arunachal Pradesh, Assam, Manipur, Tripura**

Each station monitors: rainfall intensity (mm/hr), soil moisture (%), slope displacement (tiltmeter), and pore-water pressure.

---

**Emergency Contacts**: NDMA Helpline **1070** | State Disaster **1077**
