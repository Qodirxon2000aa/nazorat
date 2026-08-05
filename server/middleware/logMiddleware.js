import ActivityLog from '../models/ActivityLog.js';

export const logAction = async (req, action, details) => {
  if (req.user) {
    try {
      await ActivityLog.create({
        userId: req.user.id,
        userName: `${req.user.name} ${req.user.surname}`,
        userRole: req.user.role,
        action,
        details,
        ipAddress: req.ip || '127.0.0.1',
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
};
