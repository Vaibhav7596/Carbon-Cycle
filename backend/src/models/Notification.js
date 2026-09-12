const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['generator', 'facility_operator', 'admin', 'all'],
      default: 'all',
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    recipientFacilityId: {
      type: String,
      trim: true,
    },
    lotId: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'MATCH_REQUEST',
        'MATCH_ACCEPTED',
        'MATCH_REJECTED',
        'TRUCK_DISPATCHED',
        'GATE_ARRIVAL',
        'CONVERSION_STARTED',
        'CERTIFICATE_READY',
        'INFO',
      ],
      default: 'INFO',
    },
    actionTab: {
      type: String,
      default: 'DASHBOARD',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast recipient querying
notificationSchema.index({ recipientRole: 1, recipientEmail: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
