const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const wasteLotRoutes = require('./routes/wasteLotRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Enable CORS for React frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
];

if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach((url) => {
    const cleaned = url.trim().replace(/\/+$/, '');
    if (cleaned) allowedOrigins.push(cleaned);
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanedOrigin = origin.replace(/\/+$/, '');
      if (
        allowedOrigins.includes(cleanedOrigin) ||
        cleanedOrigin.endsWith('.onrender.com') ||
        process.env.NODE_ENV !== 'production'
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Express Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/waste-lots', wasteLotRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Health Fallback
app.get('/', (req, res) => {
  res.json({
    message: 'CarbonCycle Waste-to-Carbon API',
    status: 'Active',
    endpoints: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me',
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start Express server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[CarbonCycle Backend]: Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[Health Endpoint]: http://localhost:${PORT}/api/health`);
  });
});
