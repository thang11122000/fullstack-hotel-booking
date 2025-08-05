import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { ResponseHelper } from "../utils/response";
import { logger } from "../utils/logger";
import { BookingService, CreateBookingData } from "../services/bookingService";
import { HotelService } from "../services/hotelService";
import { validationResult } from "express-validator";

/**
 * Create a new booking
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { room, checkInDate, checkOutDate, guests } = req.body;

    const bookingData: CreateBookingData = {
      user: req.user._id,
      room,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests,
    };

    const booking = await BookingService.createBooking(bookingData);

    return ResponseHelper.created(res, booking, "Booking created successfully");
  } catch (error: any) {
    logger.error("Create booking error:", error);

    if (
      error.message.includes("not found") ||
      error.message.includes("not available") ||
      error.message.includes("accommodate") ||
      error.message.includes("selected dates")
    ) {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to create booking");
  }
};

/**
 * Get user's bookings
 */
export const getUserBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const bookings = await BookingService.getBookingsByUser(req.user._id);

    return ResponseHelper.success(
      res,
      bookings,
      "User bookings retrieved successfully"
    );
  } catch (error) {
    logger.error("Get user bookings error:", error);
    return ResponseHelper.error(res, "Failed to retrieve user bookings");
  }
};

/**
 * Get hotel bookings (for hotel owners)
 */
export const getHotelBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    // Verify user owns a hotel
    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (!hotel) {
      return ResponseHelper.forbidden(
        res,
        "You must own a hotel to view hotel bookings"
      );
    }

    const bookings = await BookingService.getBookingsByHotel(hotel._id);
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (total, booking) => (total += booking.totalPrice),
      0
    );

    return ResponseHelper.success(
      res,
      {
        bookings,
        totalBookings,
        totalRevenue,
      },
      "Hotel bookings retrieved successfully"
    );
  } catch (error) {
    logger.error("Get hotel bookings error:", error);
    return ResponseHelper.error(res, "Failed to retrieve hotel bookings");
  }
};

export const checkAvailability = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await BookingService.checkRoomAvailability(
      room,
      checkInDate,
      checkOutDate
    );

    return ResponseHelper.success(res, { isAvailable });
  } catch (error) {
    return ResponseHelper.error(res, "Failed to check availability");
  }
};
