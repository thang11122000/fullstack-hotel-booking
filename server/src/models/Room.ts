import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoom extends Document {
  hotel: mongoose.Types.ObjectId;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  maxGuests: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  toggleAvailability(): Promise<IRoom>;
}

export interface IRoomModel extends Model<IRoom> {
  findAvailableByHotel(hotelId: mongoose.Types.ObjectId): Promise<IRoom[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<IRoom[]>;
}

const roomSchema = new Schema<IRoom>(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: [true, "Hotel reference is required"],
      index: true,
    },
    roomType: {
      type: String,
      required: [true, "Room type is required"],
      trim: true,
      enum: {
        values: ["single", "double", "suite", "deluxe", "family"],
        message:
          "Room type must be one of: single, double, suite, deluxe, family",
      },
      index: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price cannot be negative"],
      max: [10000, "Price cannot exceed 10,000"],
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
      validate: {
        validator: function (amenities: string[]) {
          return amenities.length <= 20;
        },
        message: "Cannot have more than 20 amenities",
      },
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return (
            images.length <= 10 &&
            images.every((img) =>
              /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(img)
            )
          );
        },
        message: "Invalid image URLs or too many images (max 10)",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    maxGuests: {
      type: Number,
      required: [true, "Maximum guests is required"],
      min: [1, "Room must accommodate at least 1 guest"],
      max: [10, "Room cannot accommodate more than 10 guests"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
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
roomSchema.index({ hotel: 1, isAvailable: 1 });
roomSchema.index({ roomType: 1, pricePerNight: 1 });
roomSchema.index({ pricePerNight: 1, maxGuests: 1 });

// Static methods
roomSchema.statics.findAvailableByHotel = function (
  hotelId: mongoose.Types.ObjectId
) {
  return this.find({ hotel: hotelId, isAvailable: true });
};

roomSchema.statics.findByPriceRange = function (
  minPrice: number,
  maxPrice: number
) {
  return this.find({
    pricePerNight: { $gte: minPrice, $lte: maxPrice },
    isAvailable: true,
  });
};

// Instance methods
roomSchema.methods.toggleAvailability = function () {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

export default mongoose.model<IRoom, IRoomModel>(
  "Room",
  roomSchema
) as IRoomModel;
