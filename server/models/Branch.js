import mongoose, { Schema } from 'mongoose';

const BranchSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  managerName: { type: String },
  managerId: { type: String },
  status: { type: String, enum: ['Faol', 'Nofaol'], default: 'Faol' },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
  employeeCount: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
});

export default mongoose.model('Branch', BranchSchema);
