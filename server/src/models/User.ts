import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  id: string;
  username: string;
  email: string;
  image?: string;
  role: "user" | "hotelOwner";
  recentSearchedCities: string[];
  createdAt: Date;
  updatedAt: Date;

  addRecentSearchedCity(city: string): Promise<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [2, "Username must be at least 2 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: "Please enter a valid email address",
      },
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "hotelOwner"],
      default: "user",
    },
    recentSearchedCities: {
      type: [{ type: String }],
      default: [],
    },
  },
  { timestamps: true }
);

// Compound indexes
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

userSchema.methods.addRecentSearchedCity = function (city: string) {
  const cityTrimmed = city.trim();

  const existingIndex = this.recentSearchedCities.indexOf(cityTrimmed);
  if (existingIndex > -1) {
    this.recentSearchedCities.splice(existingIndex, 1);
  }

  this.recentSearchedCities.unshift(cityTrimmed);

  if (this.recentSearchedCities.length > 5) {
    this.recentSearchedCities = this.recentSearchedCities.slice(0, 5);
  }

  return this.save();
};

export default mongoose.model<IUser>("User", userSchema);
