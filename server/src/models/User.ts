import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  _id: string;
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
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
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
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1, isActive: 1 });

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
