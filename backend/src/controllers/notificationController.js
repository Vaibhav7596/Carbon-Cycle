const Notification = require('../models/Notification');

// @desc    Get notifications for user (by role and/or email)
// @route   GET /api/notifications
// @access  Public / Protected
exports.getNotifications = async (req, res, next) => {
  try {
    const { role, email, facilityId } = req.query;

    const query = {};
    if (role || email || facilityId) {
      query.$or = [
        { recipientRole: 'all' },
        ...(role ? [{ recipientRole: role }] : []),
        ...(email ? [{ recipientEmail: email.toLowerCase() }] : []),
        ...(facilityId ? [{ recipientFacilityId: facilityId }] : []),
      ];
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notification
// @route   POST /api/notifications
// @access  Internal / Protected
exports.createNotification = async (req, res, next) => {
  try {
    const {
      recipientRole,
      recipientEmail,
      recipientFacilityId,
      lotId,
      title,
      message,
      type,
      actionTab,
      metadata,
    } = req.body;

    const notification = await Notification.create({
      recipientRole: recipientRole || 'all',
      recipientEmail: recipientEmail ? recipientEmail.toLowerCase() : undefined,
      recipientFacilityId,
      lotId,
      title,
      message,
      type: type || 'INFO',
      actionTab: actionTab || 'DASHBOARD',
      metadata: metadata || {},
    });

    res.status(201).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Public / Protected
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Public / Protected
exports.markAllAsRead = async (req, res, next) => {
  try {
    const { role, email } = req.body;
    const query = {};
    if (role || email) {
      query.$or = [
        { recipientRole: 'all' },
        ...(role ? [{ recipientRole: role }] : []),
        ...(email ? [{ recipientEmail: email.toLowerCase() }] : []),
      ];
    }

    await Notification.updateMany(query, { isRead: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
