import { Router } from 'express';
import { getRatings, createRating, updateRating, deleteRating } from '../dataManager.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { logAction } from '../middleware/logMiddleware.js';
import { broadcast } from '../sse.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const ratings = await getRatings(req.query);
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Baholarni yuklashda xatolik' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const newRating = await createRating(req.body, req.user);
    await logAction(req, 'Baho qo\'yildi', `${newRating.employeeName} ga ${newRating.stars} ⭐ qo'yildi`);
    broadcast('ratings');
    broadcast('employees');
    res.status(201).json(newRating);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Baho qo\'yishda xatolik' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await updateRating(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Baho topilmadi' });
    await logAction(req, 'Baho tahrirlandi', `Baho ID ${req.params.id} yangilandi`);
    broadcast('ratings');
    broadcast('employees');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Bahoni tahrirlashda xatolik' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteRating(req.params.id);
    await logAction(req, 'Baho o\'chirildi', `Baho ID ${req.params.id} o'chirildi`);
    broadcast('ratings');
    broadcast('employees');
    res.json({ success: true, message: "Baho o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: 'Bahoni o\'chirishda xatolik' });
  }
});

export default router;
