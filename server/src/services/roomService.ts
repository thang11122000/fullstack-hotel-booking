import mongoose from "mongoose";
import Room, { IRoom } from "../models/Room";
import Hotel from "../models/Hotel";
import Booking from "../models/Booking";
import { logger } from "../utils/logger";

export interface CreateRoomData {
  hotel: mongoose.Types.ObjectId;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  images: string[];
}

export interface RoomQuery {
  hotel?: string;
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AvailabilityQuery {
  checkIn: Date;
  checkOut: Date;
  guests: number;
  hotel?: string;
}

export class RoomService {
  /**
   * Create a new room
   */
  static async createRoom(data: CreateRoomData): Promise<IRoom> {
    try {
      // Verify hotel exists and user owns it
      const hotel = await Hotel.findById(data.hotel);
      if (!hotel) {
        throw new Error("Hotel not found");
      }

      const room = await Room.create(data);
      logger.info(`Room created successfully: ${room._id}`);
      return room;
    } catch (error) {
      logger.error("Error creating room:", error);
      throw error;
    }
  }

  /**
   * Get rooms with filtering and pagination
   */
  static async getRooms() {
    try {
      const rooms = await Room.find({ isAvailable: true }).populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      });

      return rooms;
    } catch (error) {
      logger.error("Error getting rooms:", error);
      throw error;
    }
  }

  /**
   * Get room by ID
   */
  static async getRoomById(id: string): Promise<IRoom | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid room ID");
      }

      const room = await Room.findById(id).populate(
        "hotel",
        "name address city"
      );
      return room;
    } catch (error) {
      logger.error("Error getting room by ID:", error);
      throw error;
    }
  }

  /**
   * Get rooms by hotel
   */
  static async getRoomsByHotel(hotelId: string): Promise<IRoom[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
      }

      const rooms = await Room.find({ hotel: hotelId }).populate(
        "hotel",
        "name address city"
      );
      return rooms;
    } catch (error) {
      logger.error("Error getting rooms by hotel:", error);
      throw error;
    }
  }

  /**
   * Get available rooms by hotel
   */
  static async getAvailableRoomsByHotel(hotelId: string): Promise<IRoom[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
      }

      const rooms = await Room.findAvailableByHotel(
        new mongoose.Types.ObjectId(hotelId)
      );
      return rooms;
    } catch (error) {
      logger.error("Error getting available rooms by hotel:", error);
      throw error;
    }
  }

  /**
   * Update room
   */
  static async updateRoom(
    id: string,
    updateData: Partial<CreateRoomData>
  ): Promise<IRoom | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid room ID");
      }

      const room = await Room.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("hotel", "name address city");

      if (room) {
        logger.info(`Room updated successfully: ${room._id}`);
      }

      return room;
    } catch (error) {
      logger.error("Error updating room:", error);
      throw error;
    }
  }

  /**
   * Delete room
   */
  static async deleteRoom(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid room ID");
      }

      // Check if room has active bookings
      const activeBookings = await Booking.findOne({
        room: id,
        status: { $in: ["pending", "confirmed"] },
      });

      if (activeBookings) {
        throw new Error("Cannot delete room with active bookings");
      }

      const room = await Room.findByIdAndDelete(id);

      if (room) {
        logger.info(`Room deleted successfully: ${room._id}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error deleting room:", error);
      throw error;
    }
  }

  /**
   * Toggle room availability
   */
  static async toggleRoomAvailability(id: string): Promise<IRoom | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid room ID");
      }

      const room = await Room.findById(id);
      if (!room) {
        throw new Error("Room not found");
      }

      await room.toggleAvailability();
      logger.info(
        `Room availability toggled: ${room._id} - ${room.isAvailable}`
      );

      return room;
    } catch (error) {
      logger.error("Error toggling room availability:", error);
      throw error;
    }
  }

  /**
   * Check room availability for specific dates
   */
  static async checkAvailability(
    roomId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        throw new Error("Invalid room ID");
      }

      // Check if room exists and is available
      const room = await Room.findById(roomId);
      if (!room || !room.isAvailable) {
        return false;
      }

      // Check for conflicting bookings
      const conflictingBooking = await Booking.checkRoomAvailability(
        new mongoose.Types.ObjectId(roomId),
        checkIn,
        checkOut
      );

      return !conflictingBooking;
    } catch (error) {
      logger.error("Error checking room availability:", error);
      throw error;
    }
  }

  /**
   * Search available rooms
   */
  static async searchAvailableRooms(query: AvailabilityQuery) {
    try {
      const { checkIn, checkOut, guests, hotel } = query;

      // Build base filter
      const filter: any = {
        isAvailable: true,
        maxGuests: { $gte: guests },
      };

      if (hotel && mongoose.Types.ObjectId.isValid(hotel)) {
        filter.hotel = hotel;
      }

      // Get all rooms matching basic criteria
      const rooms = await Room.find(filter).populate(
        "hotel",
        "name address city"
      );

      // Filter out rooms with conflicting bookings
      const availableRooms = [];
      for (const room of rooms) {
        const isAvailable = await this.checkAvailability(
          room._id.toString(),
          checkIn,
          checkOut
        );
        if (isAvailable) {
          availableRooms.push(room);
        }
      }

      return availableRooms;
    } catch (error) {
      logger.error("Error searching available rooms:", error);
      throw error;
    }
  }

  /**
   * Get rooms by price range
   */
  static async getRoomsByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<IRoom[]> {
    try {
      const rooms = await Room.findByPriceRange(minPrice, maxPrice);
      return rooms;
    } catch (error) {
      logger.error("Error getting rooms by price range:", error);
      throw error;
    }
  }

  /**
   * Get room statistics for a hotel
   */
  static async getRoomStatistics(hotelId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
      }

      const stats = await Room.aggregate([
        { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
        {
          $group: {
            _id: null,
            totalRooms: { $sum: 1 },
            availableRooms: {
              $sum: { $cond: [{ $eq: ["$isAvailable", true] }, 1, 0] },
            },
            averagePrice: { $avg: "$pricePerNight" },
            minPrice: { $min: "$pricePerNight" },
            maxPrice: { $max: "$pricePerNight" },
            roomTypes: { $addToSet: "$roomType" },
          },
        },
      ]);

      return (
        stats[0] || {
          totalRooms: 0,
          availableRooms: 0,
          averagePrice: 0,
          minPrice: 0,
          maxPrice: 0,
          roomTypes: [],
        }
      );
    } catch (error) {
      logger.error("Error getting room statistics:", error);
      throw error;
    }
  }
}
