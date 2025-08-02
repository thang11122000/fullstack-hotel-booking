import { ref } from "joi";
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      ref: "User",
    },
    room: {
      type: String,
      ref: "Room",
    },
    hotel: {
      type: String,
      ref: "Hotel",
    },
    checkInDate: {
      type: Date,
    },
    checkOutDate: {
      type: Date,
    },
    totalPrice: {
      type: Number,
    },
    guests: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      default: "Pay At Hotel",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
