const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret = process.env.JWT_SECRET || 'carboncycle_super_secret_jwt_key_2026_hackathon';
      const decoded = jwt.verify(token, secret);

      // Attempt to load from MongoDB if connected and id is valid Mongoose ObjectId
      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
        try {
          const user = await User.findById(decoded.id).select('-password');
          if (user) {
            req.user = user;
            return next();
          }
        } catch (dbErr) {
          // Fall through to decoded token payload
        }
      }

      // Attach decoded token user payload
      req.user = {
        id: decoded.id,
        _id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email || 'user@example.com',
        role: decoded.role || 'user',
        organizationName: decoded.organizationName || 'Agri Co-op',
        organizationType: decoded.organizationType || 'Agricultural Enterprise',
        location: decoded.location || 'Gandhinagar',
      };

      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
