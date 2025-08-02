import mongoose, { Document, Schema } from "mongoose";

export interface IHotel extends Document {
  name: string;
  address: string;
  contact: string;
  owner: mongoose.Types.ObjectId;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

const hotelSchema = new Schema<IHotel>(
  {
    name: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      minlength: [2, "Hotel name must be at least 2 characters long"],
      maxlength: [100, "Hotel name cannot exceed 100 characters"],
      index: true,
    },
    address: {
      type: String,
      required: [true, "Hotel address is required"],
      trim: true,
      minlength: [10, "Address must be at least 10 characters long"],
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    contact: {
      type: String,
      required: [true, "Contact information is required"],
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(v);
        },
        message: "Please enter a valid phone number",
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Hotel owner is required"],
      index: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City name must be at least 2 characters long"],
      maxlength: [50, "City name cannot exceed 50 characters"],
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
hotelSchema.index({ city: 1, createdAt: -1 });
hotelSchema.index({ owner: 1 }, { unique: true });
hotelSchema.index({ name: "text", address: "text", city: "text" });

// Static methods
hotelSchema.statics.findByCity = function (city: string) {
  return this.find({ city: new RegExp(city, "i") });
};

hotelSchema.statics.findByOwner = function (ownerId: mongoose.Types.ObjectId) {
  return this.findOne({ owner: ownerId });
};

export default mongoose.model<IHotel>("Hotel", hotelSchema);
