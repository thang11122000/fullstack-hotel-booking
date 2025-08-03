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

export interface HotelQuery {
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
   * Get hotels with filtering and pagination
   */
  static async getHotels(query: HotelQuery) {
    try {
      const {
        city,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = query;

      // Build filter query
      const filter: any = {};

      if (city) {
        filter.city = new RegExp(city, "i");
      }

      if (search) {
        filter.$or = [
          { name: new RegExp(search, "i") },
          { address: new RegExp(search, "i") },
          { city: new RegExp(search, "i") },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute queries in parallel
      const [hotels, total] = await Promise.all([
        Hotel.find(filter)
          .populate("owner", "username email")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Hotel.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        hotels,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting hotels:", error);
      throw error;
    }
  }

  /**
   * Get hotel by ID
   */
  static async getHotelById(id: string): Promise<IHotel | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid hotel ID");
      }

      const hotel = await Hotel.findById(id).populate(
        "owner",
        "username email"
      );
      return hotel;
    } catch (error) {
      logger.error("Error getting hotel by ID:", error);
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

  /**
   * Update hotel
   */
  static async updateHotel(
    id: string,
    updateData: Partial<CreateHotelData>
  ): Promise<IHotel | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid hotel ID");
      }

      const hotel = await Hotel.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("owner", "username email");

      if (hotel) {
        logger.info(`Hotel updated successfully: ${hotel._id}`);
      }

      return hotel;
    } catch (error) {
      logger.error("Error updating hotel:", error);
      throw error;
    }
  }

  /**
   * Delete hotel
   */
  static async deleteHotel(
    id: string,
    ownerId: mongoose.Types.ObjectId
  ): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid hotel ID");
      }

      const hotel = await Hotel.findOneAndDelete({ _id: id, owner: ownerId });

      if (hotel) {
        // Update user role back to regular user
        await User.findByIdAndUpdate(ownerId, { role: "user" });
        logger.info(`Hotel deleted successfully: ${hotel._id}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error deleting hotel:", error);
      throw error;
    }
  }

  /**
   * Get hotels by city
   */
  static async getHotelsByCity(city: string): Promise<IHotel[]> {
    try {
      const hotels = await Hotel.findByCity(city).populate(
        "owner",
        "username email"
      );
      return hotels;
    } catch (error) {
      logger.error("Error getting hotels by city:", error);
      throw error;
    }
  }

  /**
   * Search hotels with text search
   */
  static async searchHotels(
    searchTerm: string,
    limit: number = 10
  ): Promise<IHotel[]> {
    try {
      const hotels = await Hotel.find(
        { $text: { $search: searchTerm } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .populate("owner", "username email");

      return hotels;
    } catch (error) {
      logger.error("Error searching hotels:", error);
      throw error;
    }
  }
}
