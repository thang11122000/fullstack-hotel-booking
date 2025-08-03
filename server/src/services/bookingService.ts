import mongoose from "mongoose";
import Booking, { IBooking } from "../models/Booking";
import Room from "../models/Room";
import Hotel from "../models/Hotel";
import { logger } from "../utils/logger";

export interface CreateBookingData {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  hotel: mongoose.Types.ObjectId;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  paymentMethod: string;
  specialRequests?: string;
}

export interface UpdateBookingData extends Partial<CreateBookingData> {
  totalPrice?: number;
  status?: "pending" | "confirmed" | "cancelled" | "completed";
  isPaid?: boolean;
  cancellationReason?: string;
}

export interface BookingQuery {
  user?: string;
  hotel?: string;
  room?: string;
  status?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class BookingService {
  /**
   * Create a new booking
   */
  static async createBooking(data: CreateBookingData): Promise<IBooking> {
    try {
      // Validate room exists and is available
      const room = await Room.findById(data.room);
      if (!room) {
        throw new Error("Room not found");
      }

      if (!room.isAvailable) {
        throw new Error("Room is not available");
      }

      // Check if room can accommodate the number of guests
      if (data.guests > room.maxGuests) {
        throw new Error(`Room can only accommodate ${room.maxGuests} guests`);
      }

      // Check room availability for the specified dates
      const isAvailable = await this.checkRoomAvailability(
        data.room,
        data.checkInDate,
        data.checkOutDate
      );

      if (!isAvailable) {
        throw new Error("Room is not available for the selected dates");
      }

      // Calculate total price
      const nights = this.calculateNights(data.checkInDate, data.checkOutDate);
      const totalPrice = nights * room.pricePerNight;

      // Create booking
      const booking = await Booking.create({
        ...data,
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
   * Get bookings with filtering and pagination
   */
  static async getBookings(query: BookingQuery) {
    try {
      const {
        user,
        hotel,
        room,
        status,
        checkInDate,
        checkOutDate,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = query;

      // Build filter query
      const filter: any = {};

      if (user && mongoose.Types.ObjectId.isValid(user)) {
        filter.user = user;
      }

      if (hotel && mongoose.Types.ObjectId.isValid(hotel)) {
        filter.hotel = hotel;
      }

      if (room && mongoose.Types.ObjectId.isValid(room)) {
        filter.room = room;
      }

      if (status) {
        filter.status = status;
      }

      if (checkInDate || checkOutDate) {
        filter.checkInDate = {};
        if (checkInDate) filter.checkInDate.$gte = checkInDate;
        if (checkOutDate) filter.checkInDate.$lte = checkOutDate;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute queries in parallel
      const [bookings, total] = await Promise.all([
        Booking.find(filter)
          .populate("user", "username email")
          .populate("room", "roomType pricePerNight maxGuests")
          .populate("hotel", "name address city")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Booking.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        bookings,
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
      logger.error("Error getting bookings:", error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(id: string): Promise<IBooking | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid booking ID");
      }

      const booking = await Booking.findById(id)
        .populate("user", "username email")
        .populate("room", "roomType pricePerNight maxGuests amenities images")
        .populate("hotel", "name address city contact");

      return booking;
    } catch (error) {
      logger.error("Error getting booking by ID:", error);
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
   * Update booking
   */
  static async updateBooking(
    id: string,
    updateData: UpdateBookingData
  ): Promise<IBooking | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid booking ID");
      }

      // If dates are being updated, recalculate total price
      if (updateData.checkInDate || updateData.checkOutDate) {
        const booking = await Booking.findById(id).populate("room");
        if (booking) {
          const checkIn = updateData.checkInDate || booking.checkInDate;
          const checkOut = updateData.checkOutDate || booking.checkOutDate;
          const nights = this.calculateNights(checkIn, checkOut);
          updateData.totalPrice = nights * (booking.room as any).pricePerNight;
        }
      }

      const booking = await Booking.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("user", "username email")
        .populate("room", "roomType pricePerNight maxGuests")
        .populate("hotel", "name address city");

      if (booking) {
        logger.info(`Booking updated successfully: ${booking._id}`);
      }

      return booking;
    } catch (error) {
      logger.error("Error updating booking:", error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(
    id: string,
    reason: string
  ): Promise<IBooking | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid booking ID");
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status === "cancelled") {
        throw new Error("Booking is already cancelled");
      }

      if (booking.status === "completed") {
        throw new Error("Cannot cancel completed booking");
      }

      await booking.cancel(reason);
      await booking.populate([
        { path: "user", select: "username email" },
        { path: "room", select: "roomType pricePerNight" },
        { path: "hotel", select: "name address city" },
      ]);

      logger.info(`Booking cancelled successfully: ${booking._id}`);
      return booking;
    } catch (error) {
      logger.error("Error cancelling booking:", error);
      throw error;
    }
  }

  /**
   * Confirm booking
   */
  static async confirmBooking(id: string): Promise<IBooking | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid booking ID");
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "pending") {
        throw new Error("Only pending bookings can be confirmed");
      }

      await booking.confirm();
      await booking.populate([
        { path: "user", select: "username email" },
        { path: "room", select: "roomType pricePerNight" },
        { path: "hotel", select: "name address city" },
      ]);

      logger.info(`Booking confirmed successfully: ${booking._id}`);
      return booking;
    } catch (error) {
      logger.error("Error confirming booking:", error);
      throw error;
    }
  }

  /**
   * Complete booking
   */
  static async completeBooking(id: string): Promise<IBooking | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid booking ID");
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        throw new Error("Booking not found");
      }

      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be completed");
      }

      await booking.complete();
      await booking.populate([
        { path: "user", select: "username email" },
        { path: "room", select: "roomType pricePerNight" },
        { path: "hotel", select: "name address city" },
      ]);

      logger.info(`Booking completed successfully: ${booking._id}`);
      return booking;
    } catch (error) {
      logger.error("Error completing booking:", error);
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
   * Get active bookings
   */
  static async getActiveBookings(): Promise<IBooking[]> {
    try {
      const bookings = await Booking.findActiveBookings();
      return bookings;
    } catch (error) {
      logger.error("Error getting active bookings:", error);
      throw error;
    }
  }

  /**
   * Get booking statistics for a hotel
   */
  static async getBookingStatistics(hotelId: string) {
    try {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
      }

      const stats = await Booking.aggregate([
        { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
            completedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $in: ["$status", ["confirmed", "completed"]] },
                  "$totalPrice",
                  0,
                ],
              },
            },
            averageBookingValue: { $avg: "$totalPrice" },
          },
        },
      ]);

      return (
        stats[0] || {
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0,
          totalRevenue: 0,
          averageBookingValue: 0,
        }
      );
    } catch (error) {
      logger.error("Error getting booking statistics:", error);
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

  /**
   * Get upcoming check-ins for a hotel
   */
  static async getUpcomingCheckIns(
    hotelId: string,
    days: number = 7
  ): Promise<IBooking[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
      }

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const bookings = await Booking.find({
        hotel: hotelId,
        status: "confirmed",
        checkInDate: {
          $gte: today,
          $lte: futureDate,
        },
      })
        .populate("user", "username email")
        .populate("room", "roomType")
        .sort({ checkInDate: 1 });

      return bookings;
    } catch (error) {
      logger.error("Error getting upcoming check-ins:", error);
      throw error;
    }
  }

  /**
   * Get upcoming check-outs for a hotel
   */
  static async getUpcomingCheckOuts(
    hotelId: string,
    days: number = 7
  ): Promise<IBooking[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(hotelId)) {
        throw new Error("Invalid hotel ID");
      }

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const bookings = await Booking.find({
        hotel: hotelId,
        status: "confirmed",
        checkOutDate: {
          $gte: today,
          $lte: futureDate,
        },
      })
        .populate("user", "username email")
        .populate("room", "roomType")
        .sort({ checkOutDate: 1 });

      return bookings;
    } catch (error) {
      logger.error("Error getting upcoming check-outs:", error);
      throw error;
    }
  }
}
