import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Branch from './models/Branch.js';
import Employee from './models/Employee.js';
import Rating from './models/Rating.js';
import User from './models/User.js';
import Role from './models/Role.js';
import ActivityLog from './models/ActivityLog.js';
import Notification from './models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.resolve(__dirname, '..', 'data.json');
const isDbConnected = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};

const readLocalData = () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const raw = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading local data.json:', e.message);
  }
  return {
    branches: [],
    employees: [],
    ratings: [],
    users: [],
    roles: [],
    activityLogs: [],
    notifications: []
  };
};

const saveLocalData = (data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving local data.json:', e.message);
  }
};

// USERS & EMPLOYEES LOOKUP FOR AUTH
export const findUserByUsername = async (username) => {
  const cleanU = String(username || '').trim().toLowerCase();

  if (isDbConnected()) {
    try {
      const dbUser = await User.findOne({ username: cleanU });
      if (dbUser) return { ...dbUser.toObject(), id: String(dbUser._id), type: 'user' };

      const dbEmp = await Employee.findOne({ username: cleanU });
      if (dbEmp) {
        return {
          id: String(dbEmp._id), username: dbEmp.username, name: dbEmp.firstName,
          surname: dbEmp.lastName, role: 'Xodim', roleId: 'role-employee',
          branchId: dbEmp.branchId, branchName: dbEmp.branchName,
          position: dbEmp.position, status: dbEmp.status || 'Faol', phone: dbEmp.phone,
          employeeId: String(dbEmp._id), passwordHash: dbEmp.passwordHash, type: 'employee'
        };
      }
      return null;
    } catch (e) {
      console.warn('DB findUser error:', e.message);
    }
  }

  const local = readLocalData();
  const localUser = (local.users || []).find(u => String(u.username || '').toLowerCase() === cleanU);
  if (localUser) {
    return { ...localUser, id: String(localUser.id || localUser._id), type: 'user' };
  }
  const localEmp = (local.employees || []).find(e => String(e.username || '').toLowerCase() === cleanU);
  if (localEmp) {
    return {
      id: String(localEmp.id || localEmp._id), username: localEmp.username,
      name: localEmp.firstName, surname: localEmp.lastName, role: 'Xodim',
      roleId: 'role-employee', branchId: localEmp.branchId, branchName: localEmp.branchName,
      position: localEmp.position, status: localEmp.status || 'Faol', phone: localEmp.phone,
      employeeId: String(localEmp.id || localEmp._id), passwordHash: localEmp.passwordHash, type: 'employee'
    };
  }

  return null;
};

// BRANCHES
export const getBranches = async () => {
  let list = [];
  if (isDbConnected()) {
    try {
      const branches = await Branch.find();
      list = branches.map(b => ({ ...b.toObject(), id: String(b._id) }));
    } catch (e) {
      console.warn('DB getBranches error:', e.message);
    }
  } else {
    const local = readLocalData();
    list = (local.branches || []).map(b => ({ ...b, id: String(b.id || b._id) }));
  }

  const emps = await getEmployees();
  const ratings = await getRatings();

  return list.map(branch => {
    const branchEmps = emps.filter(e => 
      String(e.branchId) === String(branch.id) || 
      (e.branchName && e.branchName.toLowerCase() === branch.name.toLowerCase())
    );
    const branchRatings = ratings.filter(r => 
      String(r.branchId) === String(branch.id) || 
      (r.branchName && r.branchName.toLowerCase() === branch.name.toLowerCase())
    );
    const totalStars = branchRatings.reduce((sum, r) => sum + Number(r.stars || 0), 0);
    const avg = branchRatings.length > 0 ? Number((totalStars / branchRatings.length).toFixed(1)) : 0;
    
    return {
      ...branch,
      employeeCount: branchEmps.length,
      averageRating: avg
    };
  });
};

export const createBranch = async (data) => {
  if (isDbConnected()) {
    try {
      const newBranch = await Branch.create({
        name: data.name,
        address: data.address,
        phone: data.phone,
        managerName: data.managerName || 'Tayinlanmagan',
        status: data.status || 'Faol',
        type: data.type || 'Filial'
      });
      return { ...newBranch.toObject(), id: String(newBranch._id) };
    } catch (e) {
      console.warn('DB createBranch error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  const newObj = {
    id: `br-${Date.now()}`,
    name: data.name,
    address: data.address || '',
    phone: data.phone || '',
    managerName: data.managerName || 'Tayinlanmagan',
    status: data.status || 'Faol',
    type: data.type || 'Filial',
    createdAt: new Date().toISOString().split('T')[0]
  };
  local.branches = local.branches || [];
  local.branches.push(newObj);
  saveLocalData(local);
  return newObj;
};

export const updateBranch = async (id, data) => {
  if (isDbConnected()) {
    try {
      const updated = await Branch.findByIdAndUpdate(id, data, { new: true });
      if (updated) return { ...updated.toObject(), id: String(updated._id) };
    } catch (e) {
      console.warn('DB updateBranch error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  const idx = (local.branches || []).findIndex(b => String(b.id || b._id) === String(id));
  if (idx !== -1) {
    local.branches[idx] = { ...local.branches[idx], ...data };
    saveLocalData(local);
    return local.branches[idx];
  }
  return null;
};

export const deleteBranch = async (id) => {
  if (isDbConnected()) {
    try {
      await Branch.findByIdAndDelete(id);
      return true;
    } catch (e) {
      console.warn('DB deleteBranch error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  local.branches = (local.branches || []).filter(b => String(b.id || b._id) !== String(id));
  saveLocalData(local);
  return true;
};

// EMPLOYEES
export const getEmployees = async (query = {}) => {
  const { branchId, position, status, search } = query;
  if (isDbConnected()) {
    try {
      let dbQuery = {};
      if (branchId) dbQuery.branchId = branchId;
      if (position) dbQuery.position = { $regex: position, $options: 'i' };
      if (status) dbQuery.status = status;

      let list = await Employee.find(dbQuery);
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(e =>
          (e.firstName || '').toLowerCase().includes(q) ||
          (e.lastName || '').toLowerCase().includes(q) ||
          (e.phone || '').includes(q)
        );
      }
      return list.map(e => ({ ...e.toObject(), id: String(e._id) }));
    } catch (e) {
      console.warn('DB getEmployees error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  let list = (local.employees || []).map(e => ({ ...e, id: String(e.id || e._id) }));

  if (branchId) list = list.filter(e => String(e.branchId) === String(branchId));
  if (position) list = list.filter(e => (e.position || '').toLowerCase().includes(position.toLowerCase()));
  if (status) list = list.filter(e => e.status === status);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(e =>
      (e.firstName || '').toLowerCase().includes(q) ||
      (e.lastName || '').toLowerCase().includes(q) ||
      (e.phone || '').includes(q)
    );
  }
  return list;
};

export const createEmployee = async (data) => {
  let passwordHash = undefined;
  if (data.password) {
    try {
      const { default: bcrypt } = await import('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      passwordHash = bcrypt.hashSync(data.password, salt);
    } catch (e) {
      console.warn('Failed to hash password:', e.message);
    }
  }

  if (isDbConnected()) {
    try {
      const newEmp = await Employee.create({
        ...data,
        passwordHash,
        hireDate: new Date().toISOString().split('T')[0]
      });
      return { ...newEmp.toObject(), id: String(newEmp._id) };
    } catch (e) {
      console.warn('DB createEmployee error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  const newObj = {
    id: `emp-${Date.now()}`,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    middleName: data.middleName || '',
    phone: data.phone || '',
    position: data.position || '',
    branchId: data.branchId || '',
    branchName: data.branchName || '',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    username: data.username || `user_${Date.now()}`,
    passwordHash: passwordHash,
    status: data.status || 'Faol',
    hireDate: new Date().toISOString().split('T')[0],
    averageRating: 5.0,
    totalRatingsCount: 0
  };
  local.employees = local.employees || [];
  local.employees.push(newObj);
  saveLocalData(local);
  return newObj;
};

export const updateEmployee = async (id, data) => {
  let passwordHash = undefined;
  if (data.password) {
    try {
      const { default: bcrypt } = await import('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      passwordHash = bcrypt.hashSync(data.password, salt);
    } catch (e) {
      console.warn('Failed to hash password:', e.message);
    }
  }

  const updateData = { ...data };
  if (passwordHash) {
    updateData.passwordHash = passwordHash;
  }

  if (isDbConnected()) {
    try {
      const updated = await Employee.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) return { ...updated.toObject(), id: String(updated._id) };
    } catch (e) {
      console.warn('DB updateEmployee error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  const idx = (local.employees || []).findIndex(e => String(e.id || e._id) === String(id));
  if (idx !== -1) {
    local.employees[idx] = { ...local.employees[idx], ...updateData };
    saveLocalData(local);
    return local.employees[idx];
  }
  return null;
};

export const deleteEmployee = async (id) => {
  if (isDbConnected()) {
    try {
      await Employee.findByIdAndDelete(id);
      return true;
    } catch (e) {
      console.warn('DB deleteEmployee error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  local.employees = (local.employees || []).filter(e => String(e.id || e._id) !== String(id));
  saveLocalData(local);
  return true;
};

// RATINGS
export const getRatings = async (query = {}) => {
  const { employeeId, branchId, date } = query;
  if (isDbConnected()) {
    try {
      let dbQuery = {};
      if (employeeId) dbQuery.employeeId = employeeId;
      if (branchId) dbQuery.branchId = branchId;
      if (date) dbQuery.date = date;
      const ratings = await Rating.find(dbQuery);
      return ratings.map(r => ({ ...r.toObject(), id: String(r._id) }));
    } catch (e) {
      console.warn('DB getRatings error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  let list = (local.ratings || []).map(r => ({ ...r, id: String(r.id || r._id) }));
  if (employeeId) list = list.filter(r => String(r.employeeId) === String(employeeId));
  if (branchId) list = list.filter(r => String(r.branchId) === String(branchId));
  if (date) list = list.filter(r => r.date === date);
  return list;
};

export const createRating = async (data, user) => {
  const ratingDate = data.date || new Date().toISOString().split('T')[0];

  if (isDbConnected()) {
    try {
      const employee = await Employee.findById(data.employeeId);
      if (!employee) throw new Error('Xodim topilmadi');

      const existing = await Rating.findOne({ employeeId: data.employeeId, date: ratingDate });
      if (existing) throw new Error(`Xodim bugun (${ratingDate}) uchun allaqachon baholangan!`);

      const newRating = await Rating.create({
        employeeId: data.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        branchId: employee.branchId,
        branchName: employee.branchName,
        ratedById: user ? user.id : 'sys',
        ratedByName: user ? `${user.name} ${user.surname}` : 'Tizim',
        stars: data.stars,
        comment: data.comment,
        date: ratingDate
      });

      const empRatings = await Rating.find({ employeeId: data.employeeId });
      const avg = empRatings.reduce((sum, r) => sum + r.stars, 0) / empRatings.length;
      await Employee.findByIdAndUpdate(data.employeeId, {
        averageRating: Number(avg.toFixed(1)),
        totalRatingsCount: empRatings.length
      });

      return { ...newRating.toObject(), id: String(newRating._id) };
    } catch (e) {
      if (e.message.includes('allaqachon baholangan') || e.message.includes('Xodim topilmadi')) throw e;
      console.warn('DB createRating error, using fallback:', e.message);
    }
  }

  const local = readLocalData();
  const employee = (local.employees || []).find(e => String(e.id || e._id) === String(data.employeeId));
  if (!employee) throw new Error('Xodim topilmadi');

  const existing = (local.ratings || []).find(r => String(r.employeeId) === String(data.employeeId) && r.date === ratingDate);
  if (existing) throw new Error(`Xodim bugun (${ratingDate}) uchun allaqachon baholangan!`);

  const newObj = {
    id: `rat-${Date.now()}`,
    employeeId: String(data.employeeId),
    employeeName: `${employee.firstName} ${employee.lastName}`,
    branchId: employee.branchId,
    branchName: employee.branchName,
    ratedById: user ? user.id : 'sys',
    ratedByName: user ? `${user.name} ${user.surname}` : 'Tizim',
    stars: Number(data.stars),
    comment: data.comment || '',
    date: ratingDate,
    createdAt: new Date().toISOString()
  };

  local.ratings = local.ratings || [];
  local.ratings.push(newObj);

  // recalculate employee avg
  const empRatings = local.ratings.filter(r => String(r.employeeId) === String(data.employeeId));
  const avg = empRatings.reduce((sum, r) => sum + r.stars, 0) / empRatings.length;
  employee.averageRating = Number(avg.toFixed(1));
  employee.totalRatingsCount = empRatings.length;

  saveLocalData(local);
  return newObj;
};

export const updateRating = async (id, data) => {
  if (isDbConnected()) {
    try {
      const updated = await Rating.findByIdAndUpdate(id, data, { new: true });
      if (updated) return { ...updated.toObject(), id: String(updated._id) };
    } catch (e) {
      console.warn('DB updateRating error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  const idx = (local.ratings || []).findIndex(r => String(r.id || r._id) === String(id));
  if (idx !== -1) {
    local.ratings[idx] = { ...local.ratings[idx], ...data };
    saveLocalData(local);
    return local.ratings[idx];
  }
  return null;
};

export const deleteRating = async (id) => {
  if (isDbConnected()) {
    try {
      await Rating.findByIdAndDelete(id);
      return true;
    } catch (e) {
      console.warn('DB deleteRating error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  local.ratings = (local.ratings || []).filter(r => String(r.id || r._id) !== String(id));
  saveLocalData(local);
  return true;
};

// LOGS & NOTIFICATIONS
export const getActivityLogs = async () => {
  if (isDbConnected()) {
    try {
      const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
      return logs.map(l => ({ ...l.toObject(), id: String(l._id) }));
    } catch (e) {
      console.warn('DB getActivityLogs error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  return (local.activityLogs || []).map(l => ({ ...l, id: String(l.id || l._id) }));
};

export const getNotifications = async () => {
  if (isDbConnected()) {
    try {
      const notifs = await Notification.find().sort({ createdAt: -1 }).limit(50);
      return notifs.map(n => ({ ...n.toObject(), id: String(n._id) }));
    } catch (e) {
      console.warn('DB getNotifications error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  return (local.notifications || []).map(n => ({ ...n, id: String(n.id || n._id) }));
};

export const markNotificationRead = async (id) => {
  if (isDbConnected()) {
    try {
      await Notification.findByIdAndUpdate(id, { read: true });
      return true;
    } catch (e) {}
  }
  const local = readLocalData();
  const n = (local.notifications || []).find(item => String(item.id || item._id) === String(id));
  if (n) {
    n.read = true;
    saveLocalData(local);
  }
  return true;
};

export const markAllNotificationsRead = async () => {
  if (isDbConnected()) {
    try {
      await Notification.updateMany({}, { read: true });
      return true;
    } catch (e) {}
  }
  const local = readLocalData();
  (local.notifications || []).forEach(item => { item.read = true; });
  saveLocalData(local);
  return true;
};

// ROLES
export const getRoles = async () => {
  if (isDbConnected()) {
    try {
      const roles = await Role.find();
      return roles.map(r => ({ ...r.toObject(), id: String(r._id) }));
    } catch (e) {
      console.warn('DB getRoles error, using fallback:', e.message);
    }
  }
  const local = readLocalData();
  return (local.roles || []).map(r => ({ ...r, id: String(r.id || r._id) }));
};

export const createRole = async (data) => {
  if (isDbConnected()) {
    try {
      const newRole = await Role.create(data);
      return { ...newRole.toObject(), id: String(newRole._id) };
    } catch (e) {}
  }
  const local = readLocalData();
  const newObj = {
    id: `role-${Date.now()}`,
    name: data.name,
    description: data.description || '',
    permissions: data.permissions || [],
    isSystem: false
  };
  local.roles = local.roles || [];
  local.roles.push(newObj);
  saveLocalData(local);
  return newObj;
};

export const updateRole = async (id, data) => {
  if (isDbConnected()) {
    try {
      const updated = await Role.findByIdAndUpdate(id, data, { new: true });
      if (updated) return { ...updated.toObject(), id: String(updated._id) };
    } catch (e) {}
  }
  const local = readLocalData();
  const idx = (local.roles || []).findIndex(r => String(r.id || r._id) === String(id));
  if (idx !== -1) {
    local.roles[idx] = { ...local.roles[idx], ...data };
    saveLocalData(local);
    return local.roles[idx];
  }
  return null;
};

export const deleteRole = async (id) => {
  if (isDbConnected()) {
    try {
      const role = await Role.findById(id);
      if (role && role.isSystem) throw new Error("Tizim rollarini o'chirish taqiqlangan!");
      await Role.findByIdAndDelete(id);
      return true;
    } catch (e) {
      if (e.message.includes('Tizim rollarini')) throw e;
    }
  }
  const local = readLocalData();
  const role = (local.roles || []).find(r => String(r.id || r._id) === String(id));
  if (role && role.isSystem) throw new Error("Tizim rollarini o'chirish taqiqlangan!");
  local.roles = (local.roles || []).filter(r => String(r.id || r._id) !== String(id));
  saveLocalData(local);
  return true;
};
