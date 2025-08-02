import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  totalPrice: number;
  guests: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentMethod: string;
  isPaid: boolean;
  specialRequests?: string;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
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
      validate: {
        validator: function (date: Date) {
          return date >= new Date();
        },
        message: "Check-in date cannot be in the past",
      },
      index: true,
    },
    checkOutDate: {
      type: Date,
      required: [true, "Check-out date is required"],
      validate: {
        validator: function (this: IBooking, date: Date) {
          return date > this.checkInDate;
        },
        message: "Check-out date must be after check-in date",
      },
      index: true,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
      max: [100000, "Total price cannot exceed 100,000"],
    },
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "At least 1 guest is required"],
      max: [10, "Cannot exceed 10 guests"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed"],
        message:
          "Status must be one of: pending, confirmed, cancelled, completed",
      },
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["Pay At Hotel", "Credit Card", "PayPal", "Bank Transfer"],
        message: "Invalid payment method",
      },
      default: "Pay At Hotel",
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [500, "Special requests cannot exceed 500 characters"],
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [200, "Cancellation reason cannot exceed 200 characters"],
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

// Pre-save middleware for validation
bookingSchema.pre("save", function (next) {
  if (this.status === "cancelled" && !this.cancellationReason) {
    return next(
      new Error("Cancellation reason is required when status is cancelled")
    );
  }
  next();
});

// Static methods
bookingSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ user: userId }).populate("room hotel");
};

bookingSchema.statics.findByHotel = function (
  hotelId: mongoose.Types.ObjectId
) {
  return this.find({ hotel: hotelId }).populate("user room");
};

bookingSchema.statics.findActiveBookings = function () {
  return this.find({ status: { $in: ["pending", "confirmed"] } });
};

bookingSchema.statics.checkRoomAvailability = function (
  roomId: mongoose.Types.ObjectId,
  checkIn: Date,
  checkOut: Date
) {
  return this.findOne({
    room: roomId,
    status: { $in: ["pending", "confirmed"] },
    $or: [
      { checkInDate: { $lt: checkOut, $gte: checkIn } },
      { checkOutDate: { $gt: checkIn, $lte: checkOut } },
      { checkInDate: { $lte: checkIn }, checkOutDate: { $gte: checkOut } },
    ],
  });
};

// Instance methods
bookingSchema.methods.cancel = function (reason: string) {
  this.status = "cancelled";
  this.cancellationReason = reason;
  return this.save();
};

bookingSchema.methods.confirm = function () {
  this.status = "confirmed";
  return this.save();
};

bookingSchema.methods.complete = function () {
  this.status = "completed";
  return this.save();
};

bookingSchema.methods.calculateNights = function () {
  const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export default mongoose.model<IBooking>("Booking", bookingSchema);
