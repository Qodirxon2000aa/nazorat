import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Role from './models/Role.js';

export const PERMISSIONS_LIST = [
  { id: 'filial_view', name: "Filiallarni ko'rish", category: 'filiallar', description: "Barcha filiallar ro'yxatini ko'rish ruxsati" },
  { id: 'filial_add', name: "Filial qo'shish", category: 'filiallar', description: "Yangi filiallar yaratish ruxsati" },
  { id: 'filial_edit', name: "Filial tahrirlash", category: 'filiallar', description: "Mavjud filial ma'lumotlarini o'zgartirish" },
  { id: 'filial_delete', name: "Filial o'chirish", category: 'filiallar', description: "Filialni tizimdan o'chirish" },
  
  { id: 'xodim_view', name: "Xodimlarni ko'rish", category: 'xodimlar', description: "Barcha xodimlarni va ularning profilini ko'rish" },
  { id: 'xodim_add', name: "Xodim qo'shish", category: 'xodimlar', description: "Yangi xodim biriktirish va unga login yaratish" },
  { id: 'xodim_edit', name: "Xodim tahrirlash", category: 'xodimlar', description: "Xodim lavozimi, filiali va ma'lumotlarini tahrirlash" },
  { id: 'xodim_delete', name: "Xodim o'chirish", category: 'xodimlar', description: "Xodimni tizimdan o'chirish" },

  { id: 'baho_add', name: "Baho qo'yish", category: 'baholash', description: "Xodimlarga kunlik 1-5 yulduzli baho va izoh berish" },
  { id: 'baho_edit', name: "Bahoni tahrirlash", category: 'baholash', description: "Qo'yilgan baholarni qayta ko'rib chiqish" },

  { id: 'hisobot_view', name: "Hisobotlarni ko'rish", category: 'hisobotlar', description: "Kunlik, oylik va yillik hisobotlarni ko'rish" },
  { id: 'hisobot_export', name: "Excel/PDF export", category: 'hisobotlar', description: "Hisobotlarni Excel, PDF va CSV formatlarida yuklab olish" },

  { id: 'statistika_view', name: "Statistikani ko'rish", category: 'statistika', description: "Barcha tahliliy va grafik statistikalarni ko'rish" },

  { id: 'rollar_manage', name: "Rollarni boshqarish", category: 'rollar', description: "Foydalanuvchilar rollari va ruxsatlarini tahrirlash" },
  { id: 'log_view', name: "Faoliyat jurnalini ko'rish", category: 'tizim', description: "A'zolar harakatlari audit faoliyatini ko'rish" },
];

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/filiallar_db');
    console.log(`MongoDB connected: ${conn.connection.host}`);

    // Ensure Super Admin user exists
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync('admin', salt);
      await User.create({
        username: 'admin',
        passwordHash: hash,
        name: 'Super',
        surname: 'Admin',
        status: 'Faol',
        role: 'Super Admin',
        roleId: 'admin_role'
      });
      console.log('Admin account initialized.');
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

const seedData = async () => {
  const salt = bcrypt.genSaltSync(10);
  const rolesData = [
    { name: 'Super Admin', description: 'Tizim bo\'yicha cheklanmagan to\'liq ruxsatlar', permissions: PERMISSIONS_LIST.map((p) => p.id), isSystem: true },
    { name: 'Xodim', description: 'Faqat o\'z ko\'rsatkichlari va reytingini ko\'rish', permissions: ['xodim_view', 'statistika_view'], isSystem: true },
  ];
  
  const createdRoles = await Role.insertMany(rolesData);
  const roleSuperAdmin = createdRoles.find(r => r.name === 'Super Admin');

  // Hash 'admin'
  const hashedPassword = bcrypt.hashSync('admin', salt);

  const usersData = [
    { 
      username: 'admin', 
      passwordHash: hashedPassword, 
      name: 'Super', 
      surname: 'Admin', 
      email: 'admin@filial.uz', 
      role: 'Super Admin', 
      roleId: roleSuperAdmin._id, 
      status: 'Faol', 
      phone: '+998 90 000 00 01', 
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' 
    }
  ];
  
  await User.insertMany(usersData);
};
