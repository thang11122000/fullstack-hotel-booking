import mongoose from "mongoose";
import Hotel, { IHotel } from "../models/Hotel";
import User from "../models/User";
import { logger } from "../utils/logger";

export interface CreateHotelData {
  name: string;
  address: string;
  contact: string;
  city: string;
  owner: mongoose.Types.ObjectId;
}

export class HotelService {
  /**
   * Create a new hotel
   */
  static async createHotel(data: CreateHotelData): Promise<IHotel> {
    try {
      // Check if user already has a hotel
      const existingHotel = await Hotel.findOne({ owner: data.owner });
      if (existingHotel) {
        throw new Error("User already has a registered hotel");
      }

      // Create hotel
      const hotel = await Hotel.create(data);

      // Update user role to hotel owner
      await User.findByIdAndUpdate(data.owner, { role: "hotelOwner" });

      logger.info(`Hotel created successfully: ${hotel._id}`);
      return hotel;
    } catch (error) {
      logger.error("Error creating hotel:", error);
      throw error;
    }
  }

  /**
   * Get hotel by owner ID
   */
  static async getHotelByOwner(
    ownerId: mongoose.Types.ObjectId
  ): Promise<IHotel | null> {
    try {
      const hotel = await Hotel.findOne({ owner: ownerId }).populate(
        "owner",
        "username email"
      );
      return hotel;
    } catch (error) {
      logger.error("Error getting hotel by owner:", error);
      throw error;
    }
  }
}
