import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Types.ObjectId,
      ref: "Hotel",
    },
    roomType: {
      type: String,
    },
    pricePerNight: {
      type: Number,
    },
    amenities: {
      type: Array,
    },
    images: [
      {
        type: String,
      },
    ],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
