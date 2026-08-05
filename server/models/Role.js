import mongoose, { Schema } from 'mongoose';

const RoleSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  permissions: [{ type: String }],
  isSystem: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Role', RoleSchema);
