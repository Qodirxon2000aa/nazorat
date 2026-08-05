import mongoose, { Schema } from 'mongoose';

const RatingSchema = new Schema({
  employeeId: { type: String, required: true },
  employeeName: { type: String, required: true },
  branchId: { type: String, required: true },
  branchName: { type: String, required: true },
  ratedById: { type: String, required: true },
  ratedByName: { type: String, required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export default mongoose.model('Rating', RatingSchema);
