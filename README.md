# CarbonCycle — Waste-to-Carbon Value Chain Tracker

> **Hackathon Edition 2026**  
> An end-to-end, rule-based decision and traceability platform connecting waste generators with conversion facilities, optimizing GIS route transport, and generating auditable net CO₂e climate impact reports.

🚀 **Live Application**: [https://carbon-cycle-gev0.onrender.com/](https://carbon-cycle-gev0.onrender.com/)  
🔗 **Live Backend API**: [https://carbon-cycle-api.onrender.com/api/health](https://carbon-cycle-api.onrender.com/api/health)

---

## 🌟 Key Features

1. **Waste Registration & Fingerprinting**: Enter waste batch details (quantity, moisture %, organic fraction %, contamination) to generate a structured Waste Fingerprint.
2. **Transparent Decision Engine**: Rule-based recommendation engine scoring pathway suitability (**Biochar Pyrolysis**, **Biogas Anaerobic Digestion**, **Aerobic Composting**, **Biomass Pellets**).
3. **Facility Matching**: Rank compatible conversion facilities using a multi-factor score (Compatibility, Distance, Capacity, and Carbon Benefit).
4. **GIS Route Visualization**: Interactive **Leaflet / OpenStreetMap** map rendering straight-line polyline transit routes with Haversine distance, travel time, and transport emissions.
5. **Role-Based Authentication**: Role-tailored dashboards for **Waste Generators**, **Facility Operators**, and **System Administrators** with automatic role detection and MongoDB Atlas persistence.
6. **Auditable Digital Impact Reports**: Complete breakdown of avoided landfill methane emissions, permanent carbon stored, transport footprint, and net CO₂e climate impact.

---

## 🚀 Tech Stack

- **Frontend**: React (TypeScript), Vite, Vanilla CSS + Tailwind, Lucide Icons, Leaflet / React-Leaflet
- **Backend**: Node.js, Express, Mongoose / MongoDB Atlas, JWT Authentication, bcryptjs
- **GIS Mapping**: Leaflet.js with OpenStreetMap (No API Key Required)

---

## 🛠️ Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seed demo users to MongoDB Atlas
npm start        # Starts Express server on http://localhost:5000
```

### 2. Frontend Setup
```bash
# In the project root
npm install
npm run dev      # Starts Vite dev server on http://localhost:3000
```

---

## 🔐 Demo Credentials

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Waste Generator** | `generator@carboncycle.io` | `Password123!` | Gandhinagar Farmers Co-op |
| **Facility Operator** | `facility@carboncycle.io` | `Password123!` | Gujarat EcoChar Pyrolysis Center |
| **System Admin** | `admin@carboncycle.io` | `AdminPass123!` | CarbonCycle System Administration |

---

## 📜 Disclaimer
*Carbon calculations provide indicative climate impact estimates for hackathon demonstration purposes and do not represent certified carbon offset credits.*
