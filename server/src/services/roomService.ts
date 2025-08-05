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
}
