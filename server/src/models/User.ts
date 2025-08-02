import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  image?: string;
  role: "user" | "hotelOwner";
  recentSearchedCities: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateLastLogin(): Promise<IUser>;
  addRecentSearchedCity(city: string): Promise<IUser>;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [2, "Username must be at least 2 characters long"],
      maxlength: [50, "Username cannot exceed 50 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
      index: true,
    },
    image: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Image must be a valid URL",
      },
    },
    role: {
      type: String,
      enum: {
        values: ["user", "hotelOwner"],
        message: "Role must be either 'user' or 'hotelOwner'",
      },
      default: "user",
      index: true,
    },
    recentSearchedCities: {
      type: [String],
      default: [],
      validate: {
        validator: function (cities: string[]) {
          return cities.length <= 5;
        },
        message: "Cannot store more than 5 recent searched cities",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
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

// Compound indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ email: 1, isActive: 1 });

// Instance methods
userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

userSchema.methods.addRecentSearchedCity = function (city: string) {
  const cityTrimmed = city.trim();

  // Remove city if it already exists
  const existingIndex = this.recentSearchedCities.indexOf(cityTrimmed);
  if (existingIndex > -1) {
    this.recentSearchedCities.splice(existingIndex, 1);
  }

  // Add city to the beginning (most recent)
  this.recentSearchedCities.unshift(cityTrimmed);

  // Keep only the last 5 cities
  if (this.recentSearchedCities.length > 5) {
    this.recentSearchedCities = this.recentSearchedCities.slice(0, 5);
  }

  return this.save();
};

// Static methods
userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true });
};

userSchema.statics.findByRole = function (role: string) {
  return this.find({ role, isActive: true });
};

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

export default mongoose.model<IUser>("User", userSchema);
