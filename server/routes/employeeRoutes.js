import { Router } from 'express';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../dataManager.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { logAction } from '../middleware/logMiddleware.js';
import { broadcast } from '../sse.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const list = await getEmployees(req.query);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Xodimlarni yuklashda xatolik' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const newEmp = await createEmployee(req.body);
    await logAction(req, 'Xodim qo\'shildi', `${newEmp.firstName} xodimi yaratildi`);
    broadcast('employees');
    res.status(201).json(newEmp);
  } catch (error) {
    res.status(500).json({ error: 'Xodim yaratishda xatolik' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await updateEmployee(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Xodim topilmadi' });
    await logAction(req, 'Xodim tahrirlandi', `${updated.firstName} ma'lumotlari yangilandi`);
    broadcast('employees');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Xodimni tahrirlashda xatolik' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteEmployee(req.params.id);
    await logAction(req, 'Xodim o\'chirildi', `Xodim o'chirildi`);
    broadcast('employees');
    res.json({ success: true, message: "Xodim o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: 'Xodimni o\'chirishda xatolik' });
  }
});

export default router;
