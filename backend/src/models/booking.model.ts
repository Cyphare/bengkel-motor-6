import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { BOOKING_TYPE, BookingType, SERVICE_STATUS, ServiceStatus } from '../constants';
import { jakartaDate } from '../utils/jakartaDate';

export interface IPartUsedItem {
  _id?: Types.ObjectId;
  partId: Types.ObjectId;
  code: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  addedAt: Date;
}

export interface IStatusHistory {
  status: ServiceStatus;
  changedBy: Types.ObjectId;
  changedAt: Date;
  notes?: string;
}

export interface IBooking extends Document {
  bookingNumber: string;
  bookingType: BookingType;
  customerId?: Types.ObjectId;
  customerName: string;
  customerPhone: string;
  plateNumber: string;
  motorModel: string;
  complaint: string;
  serviceId?: Types.ObjectId;
  serviceName?: string;
  mechanicId?: Types.ObjectId;
  status: ServiceStatus;
  statusHistory: IStatusHistory[];
  mechanicNotes?: string;
  serviceFee: number;
  partsUsed: IPartUsedItem[];
  partsTotalCost: number;
  grandTotal: number;
  serviceDate: Date;
  completedAt?: Date;
  pickedUpAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingModel extends Model<IBooking> {
  generateBookingNumber(): Promise<string>;
}

const partUsedItemSchema = new Schema<IPartUsedItem>({
  partId: { type: Schema.Types.ObjectId, ref: 'Part', required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true, min: 0 },
  addedAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new Schema<IStatusHistory>({
  status: { type: String, enum: Object.values(SERVICE_STATUS), required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
});

const bookingSchema = new Schema<IBooking, IBookingModel>(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    bookingType: {
      type: String,
      enum: Object.values(BOOKING_TYPE),
      default: BOOKING_TYPE.WALK_IN,
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    customerName: {
      type: String,
      required: [true, 'Nama pelanggan wajib diisi'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Nomor telepon pelanggan wajib diisi'],
      trim: true,
    },
    plateNumber: {
      type: String,
      required: [true, 'Nomor plat kendaraan wajib diisi'],
      uppercase: true,
      trim: true,
      index: true,
    },
    motorModel: {
      type: String,
      required: [true, 'Tipe/Model motor wajib diisi (misal: Vario 160, Beat FI)'],
      trim: true,
    },
    complaint: {
      type: String,
      required: [true, 'Keluhan kendaraan wajib diisi'],
      trim: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
    },
    serviceName: {
      type: String,
      trim: true,
    },
    mechanicId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SERVICE_STATUS),
      default: SERVICE_STATUS.ANTRE,
      index: true,
    },
    statusHistory: [statusHistorySchema],
    mechanicNotes: {
      type: String,
      trim: true,
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    partsUsed: [partUsedItemSchema],
    partsTotalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    serviceDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Format: MC-YYYYMMDD-XXXX
bookingSchema.statics.generateBookingNumber = async function (): Promise<string> {
  const datePrefix = `MC-${jakartaDate(new Date()).replaceAll('-', '')}-`;

  const latestBooking = await this.findOne({
    bookingNumber: new RegExp(`^${datePrefix}`),
  })
    .sort({ bookingNumber: -1 })
    .select('bookingNumber');

  let nextSequence = 1;
  if (latestBooking && latestBooking.bookingNumber) {
    const parts = latestBooking.bookingNumber.split('-');
    const currentSeq = parseInt(parts[2], 10);
    if (!isNaN(currentSeq)) {
      nextSequence = currentSeq + 1;
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${datePrefix}${paddedSequence}`;
};

export const Booking = mongoose.model<IBooking, IBookingModel>('Booking', bookingSchema);
