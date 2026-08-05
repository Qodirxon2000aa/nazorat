import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'filial_system_secret_key_2026';

export const authenticateToken = (req, res, next) => {
  // Foydalanuvchi iltimosiga binoan, avtorizatsiya butunlay olib tashlandi
  req.user = {
    id: 'admin_id',
    username: 'admin',
    name: 'Super',
    surname: 'Admin',
    role: 'Super Admin',
    permissions: [
      "filial_view",
      "filial_add",
      "filial_edit",
      "filial_delete",
      "xodim_view",
      "xodim_add",
      "xodim_edit",
      "xodim_delete",
      "baho_view",
      "baho_add",
      "statistika_view",
      "sozlamalar_view"
    ]
  };
  next();
};
