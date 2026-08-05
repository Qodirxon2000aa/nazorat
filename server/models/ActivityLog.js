import mongoose, { Schema } from 'mongoose';

const ActivityLogSchema = new Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  ipAddress: { type: String },
});

export default mongoose.model('ActivityLog', ActivityLogSchema);
