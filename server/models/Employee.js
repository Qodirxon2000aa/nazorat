import mongoose, { Schema } from 'mongoose';

const EmployeeSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  middleName: { type: String },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  branchId: { type: String, required: true },
  branchName: { type: String, required: true },
  avatar: { type: String },
  username: { type: String },
  status: { type: String, enum: ['Faol', 'Nofaol', 'Ta\'tilda'], default: 'Faol' },
  hireDate: { type: String },
  averageRating: { type: Number, default: 0 },
  totalRatingsCount: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Employee', EmployeeSchema);
