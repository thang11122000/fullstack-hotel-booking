import mongoose from "mongoose";
import { logger } from "../utils/logger";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-booking";

export const connectMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI + "/hotel-booking");
    logger.info("✅ Connected to MongoDB");
  } catch (error) {
    logger.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const disconnectMongo = async () => {
  try {
    await mongoose.connection.close();
    logger.info("🔌 MongoDB connection closed");
  } catch (error) {
    logger.error("❌ Error closing MongoDB connection:", error);
  }
};
