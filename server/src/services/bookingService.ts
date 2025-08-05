import mongoose from "mongoose";
import Booking, { IBooking } from "../models/Booking";
import Room from "../models/Room";
import Hotel from "../models/Hotel";
import { logger } from "../utils/logger";

export interface CreateBookingData {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
}

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(data: CreateBookingData): Promise<IBooking> {
    try {
      // Check room availability for the specified dates
      const isAvailable = await this.checkRoomAvailability(
        data.room,
        data.checkInDate,
        data.checkOutDate
      );

      if (!isAvailable) {
        throw new Error("Room is not available for the selected dates");
      }
      // Validate room exists and is available
      const room = await Room.findById(data.room).populate("hotel");
      if (!room) {
        throw new Error("Room not found");
      }

      // Calculate total price
      const nights = this.calculateNights(data.checkInDate, data.checkOutDate);
      const totalPrice = nights * room.pricePerNight;

      // Create booking
      const booking = await Booking.create({
        ...data,
        hotel: room.hotel?._id,
        totalPrice,
      });

      // Populate the booking with related data
      await booking.populate([
        { path: "user", select: "username email" },
        { path: "room", select: "roomType pricePerNight maxGuests" },
        { path: "hotel", select: "name address city" },
      ]);

      logger.info(`Booking created successfully: ${booking._id}`);
      return booking;
    } catch (error) {
      logger.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Get bookings by user
   */
  static async getBookingsByUser(
    userId: mongoose.Types.ObjectId
  ): Promise<IBooking[]> {
    try {
      const bookings = await Booking.findByUser(userId);
      return bookings;
    } catch (error) {
      logger.error("Error getting bookings by user:", error);
      throw error;
    }
  }

  /**
   * Get bookings by hotel
   */
  static async getBookingsByHotel(
    hotelId: mongoose.Types.ObjectId
  ): Promise<IBooking[]> {
    try {
      const bookings = await Booking.findByHotel(hotelId);
      return bookings;
    } catch (error) {
      logger.error("Error getting bookings by hotel:", error);
      throw error;
    }
  }

  /**
   * Check room availability for specific dates
   */
  static async checkRoomAvailability(
    roomId: mongoose.Types.ObjectId,
    checkIn: Date,
    checkOut: Date
  ): Promise<boolean> {
    try {
      const conflictingBooking = await Booking.checkRoomAvailability(
        roomId,
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
   * Calculate number of nights between two dates
   */
  private static calculateNights(checkIn: Date, checkOut: Date): number {
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
}
