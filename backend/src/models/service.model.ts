import mongoose, { Schema } from 'mongoose';

const serviceSchema = new Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  estimatedPrice: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  estimatedDurationMinutes: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
