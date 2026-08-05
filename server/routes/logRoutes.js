import { Router } from 'express';
import { getActivityLogs, getNotifications, markNotificationRead, markAllNotificationsRead } from '../dataManager.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/activity-logs', authenticateToken, async (req, res) => {
  try {
    const logs = await getActivityLogs();
    res.json(logs);
  } catch (e) {
    res.status(500).json({ error: 'Jurnalni yuklashda xatolik' });
  }
});

router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifs = await getNotifications();
    res.json(notifs);
  } catch (e) {
    res.status(500).json({ error: 'Bildirishnomalarni yuklashda xatolik' });
  }
});

router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    await markNotificationRead(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await markAllNotificationsRead();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

export default router;
