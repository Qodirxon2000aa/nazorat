import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole } from '../dataManager.js';
import { PERMISSIONS_LIST } from '../db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/permissions', authenticateToken, (req, res) => {
  res.json(PERMISSIONS_LIST || []);
});

router.get('/roles', authenticateToken, async (req, res) => {
  try {
    const roles = await getRoles();
    res.json(roles);
  } catch (e) {
    res.status(500).json({ error: 'Rollarni yuklashda xatolik' });
  }
});

router.post('/roles', authenticateToken, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ error: 'Rol nomi kiritilishi shart!' });
    const newRole = await createRole({ name, description, permissions });
    res.status(201).json(newRole);
  } catch (e) {
    res.status(500).json({ error: 'Rol yaratishda xatolik' });
  }
});

router.put('/roles/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await updateRole(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Rol topilmadi' });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Rolni tahrirlashda xatolik' });
  }
});

router.delete('/roles/:id', authenticateToken, async (req, res) => {
  try {
    await deleteRole(req.params.id);
    res.json({ success: true, message: "Rol muvaffaqiyatli o'chirildi" });
  } catch (error) {
    res.status(400).json({ error: error.message || "Rolni o'chirishda xatolik" });
  }
});

export default router;
