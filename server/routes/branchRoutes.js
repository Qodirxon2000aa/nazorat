import { Router } from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../dataManager.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { logAction } from '../middleware/logMiddleware.js';
import { broadcast } from '../sse.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const branches = await getBranches();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Filiallarni yuklashda xatolik' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, address, phone, managerName, status } = req.body;
    const newBranch = await createBranch({ name, address, phone, managerName, status });
    await logAction(req, 'Filial yaratildi', `${newBranch.name} yangi filiali yaratildi`);
    broadcast('branches');
    res.status(201).json(newBranch);
  } catch (error) {
    res.status(500).json({ error: 'Filial yaratishda xatolik' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updated = await updateBranch(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Filial topilmadi' });
    await logAction(req, 'Filial tahrirlandi', `${updated.name} ma'lumotlari yangilandi`);
    broadcast('branches');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Filialni tahrirlashda xatolik' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await deleteBranch(req.params.id);
    await logAction(req, 'Filial o\'chirildi', `Filial o'chirildi`);
    broadcast('branches');
    res.json({ success: true, message: "Filial o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: 'Filialni o\'chirishda xatolik' });
  }
});

export default router;
