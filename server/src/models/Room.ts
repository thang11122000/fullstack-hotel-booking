import mongoose, { Document, Schema, Model } from "mongoose";

export interface IRoom extends Document {
  hotel: mongoose.Types.ObjectId;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  toggleAvailability(): Promise<IRoom>;
}

export interface IRoomModel extends Model<IRoom> {}

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
      minlength: [2, "Room type must be at least 2 characters long"],
      maxlength: [50, "Room type cannot exceed 50 characters"],
      index: true,
    },
    pricePerNight: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price per night must be a positive number"],
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
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

// Instance methods
roomSchema.methods.toggleAvailability = function () {
  this.isAvailable = !this.isAvailable;
  return this.save();
};

export default mongoose.model<IRoom, IRoomModel>(
  "Room",
  roomSchema
) as IRoomModel;
