# CarbonCycle Backend API (Phase 1 & 2)

Node.js, Express.js, MongoDB (Mongoose), JWT & Role-Based Authentication service for CarbonCycle.

## Features
- **MongoDB Database**: User collection with Mongoose ODM validation.
- **Bcrypt Password Hashing**: Passwords are securely hashed before database storage.
- **JWT Authentication**: Token-based authentication (`Authorization: Bearer <token>`).
- **Role-Based Access Control**: Middleware enforcement for `user` and `admin` roles.
- **CORS Configured**: Prepared for React frontend requests.

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/health` | Public | API Health Check |
| POST | `/api/auth/register` | Public | Register new user (defaults to `role: user`) |
| POST | `/api/auth/login` | Public | Authenticate user & get JWT token |
| GET | `/api/auth/me` | Protected | Get current logged-in user profile |
| POST | `/api/auth/logout` | Public | Logout acknowledgement |
| GET | `/api/admin/dashboard` | Admin Only | Protected admin dashboard endpoint |

## Running Backend

```bash
cd backend
npm install
npm run dev
```

Server starts on `http://localhost:5000`.
