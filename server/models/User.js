import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String },
  role: { type: String, required: true },
  roleId: { type: String, required: true },
  branchId: { type: String },
  branchName: { type: String },
  status: { type: String, enum: ['Faol', 'Nofaol', 'Ta\'tilda'], default: 'Faol' },
  position: { type: String },
  phone: { type: String },
  avatar: { type: String },
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
