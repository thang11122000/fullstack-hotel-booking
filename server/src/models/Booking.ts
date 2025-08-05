import mongoose, { Document, Schema, Model } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  guests: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentMethod: string;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookingModel extends Model<IBooking> {
  // Static methods
  findByUser(userId: mongoose.Types.ObjectId): Promise<IBooking[]>;
  findByHotel(hotelId: mongoose.Types.ObjectId): Promise<IBooking[]>;
  checkRoomAvailability(
    roomId: mongoose.Types.ObjectId,
    checkIn: Date,
    checkOut: Date
  ): Promise<IBooking | null>;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: [true, "Room reference is required"],
      index: true,
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
      index: true,
    },
    checkInDate: {
      type: Date,
      required: [true, "Check-in date is required"],
      // validate: {
      //   validator: function (date: Date) {
      //     return date >= new Date();
      //   },
      //   message: "Check-in date cannot be in the past",
      // },
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
      // validate: {
      //   validator: function (this: IBooking, date: Date) {
      //     return date > this.checkInDate;
      //   },
      //   message: "Check-out date must be after check-in date",
      // },
      index: true,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price must be a positive number"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "Number of guests must be at least 1"],
      max: [10, "Number of guests cannot exceed 10"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled"],
        message: "Status must be one of: pending, confirmed, cancelled",
      },
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      default: "Pay At Hotel",
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for better query performance
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ hotel: 1, status: 1 });
bookingSchema.index({ room: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Static methods
bookingSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ user: userId }).populate("room hotel");
};

bookingSchema.statics.findByHotel = function (
  hotelId: mongoose.Types.ObjectId
) {
  return this.find({ hotel: hotelId }).populate("user room");
};

bookingSchema.statics.checkRoomAvailability = function (
  roomId: mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date
) {
  return this.findOne({
    room: roomId,
    $or: [
      { checkInDate: { $lt: checkOut, $gte: checkIn } },
      { checkOutDate: { $gt: checkIn, $lte: checkOut } },
      { checkInDate: { $lte: checkIn }, checkOutDate: { $gte: checkOut } },
    ],
  });
};

export default mongoose.model<IBooking, IBookingModel>(
  "Booking",
  bookingSchema
);
