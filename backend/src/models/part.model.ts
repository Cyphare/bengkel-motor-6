import mongoose, { Schema } from 'mongoose';

const partSchema = new Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  minStock: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  price: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
  unit: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true } });

partSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.minStock;
});

export const Part = mongoose.model('Part', partSchema);
