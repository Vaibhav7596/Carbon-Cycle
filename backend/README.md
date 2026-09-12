# CarbonCycle Backend API

Node.js, Express.js, MongoDB (Mongoose), JWT & Role-Based Authentication service for CarbonCycle.

🚀 **Live Frontend**: [https://carbon-cycle-gev0.onrender.com/](https://carbon-cycle-gev0.onrender.com/)  
🔗 **Live API Service**: [https://carbon-cycle-api.onrender.com/api/health](https://carbon-cycle-api.onrender.com/api/health)

## Features
- **MongoDB Database**: User, Facility, and WasteLot collections with Mongoose ODM validation.
- **Bcrypt Password Hashing**: Passwords are securely hashed before database storage.
- **JWT Authentication**: Token-based authentication (`Authorization: Bearer <token>`).
- **Role-Based Access Control**: Middleware enforcement for `generator`, `facility_operator`, and `admin` roles.
- **CORS Configured**: Prepared for React frontend requests.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API Health Check |
| POST | `/api/auth/register` | Public | Register new user (defaults to `role: generator`) |
| POST | `/api/auth/login` | Public | Authenticate user & get JWT token |
| GET | `/api/auth/me` | Protected | Get current logged-in user profile |
| GET | `/api/facilities` | Public | Fetch all conversion facilities |
| POST | `/api/facilities` | Protected | Register a new facility |
| GET | `/api/waste-lots` | Public | Fetch all live waste batches |
| POST | `/api/waste-lots` | Public | Create new waste batch (auto-generates ID & recommendation) |
| PUT | `/api/waste-lots/:id/match` | Public | Match batch with a facility & compute logistics |
| PUT | `/api/waste-lots/:id/status` | Public | Advance batch lifecycle status (`PICKUP`, `IN_TRANSIT`, etc.) |
| POST | `/api/waste-lots/reset` | Public | Reset demo dataset |
| GET | `/api/admin/users` | Admin Only | List all registered users |
| GET | `/api/admin/dashboard` | Admin Only | Protected admin dashboard endpoint |

## Running Backend

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:5000`.
