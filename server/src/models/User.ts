import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  image: string;
  role: "user" | "hotelOwner";
  recentSearchedCities: string[];
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "hotelOwner"],
      default: "user",
    },
    recentSearchedCities: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);
