import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "../utils/response";
import { logger } from "@/utils/logger";
import {
  BookingService,
  CreateBookingData,
  BookingQuery,
} from "@/services/bookingService";
import { HotelService } from "@/services/hotelService";
import { RoomService } from "@/services/roomService";
import { validationResult } from "express-validator";

/**
 * Create a new booking
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const {
      room,
      hotel,
      checkInDate,
      checkOutDate,
      guests,
      paymentMethod,
      specialRequests,
    } = req.body;

    const bookingData: CreateBookingData = {
      user: req.user._id,
      room,
      hotel,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      guests,
      paymentMethod: paymentMethod || "Pay At Hotel",
      specialRequests,
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
 * Get bookings with filtering and pagination
 */
export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const query: BookingQuery = {
      user: req.query.user as string,
      hotel: req.query.hotel as string,
      room: req.query.room as string,
      status: req.query.status as string,
      checkInDate: req.query.checkInDate
        ? new Date(req.query.checkInDate as string)
        : undefined,
      checkOutDate: req.query.checkOutDate
        ? new Date(req.query.checkOutDate as string)
        : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    // If user is not hotel owner, only show their own bookings
    if (req.user.role !== "hotelOwner") {
      query.user = req.user._id.toString();
    }

    const result = await BookingService.getBookings(query);

    return ResponseHelper.paginated(
      res,
      result.bookings,
      result.pagination,
      "Bookings retrieved successfully"
    );
  } catch (error) {
    logger.error("Get bookings error:", error);
    return ResponseHelper.error(res, "Failed to retrieve bookings");
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;
    const booking = await BookingService.getBookingById(id);

    if (!booking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    // Check if user has permission to view this booking
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isHotelOwner =
      req.user.role === "hotelOwner" &&
      (await HotelService.getHotelByOwner(req.user._id));

    if (!isOwner && !isHotelOwner) {
      return ResponseHelper.forbidden(
        res,
        "You don't have permission to view this booking"
      );
    }

    return ResponseHelper.success(
      res,
      booking,
      "Booking retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get booking by ID error:", error);

    if (error.message === "Invalid booking ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve booking");
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

    return ResponseHelper.success(
      res,
      bookings,
      "Hotel bookings retrieved successfully"
    );
  } catch (error) {
    logger.error("Get hotel bookings error:", error);
    return ResponseHelper.error(res, "Failed to retrieve hotel bookings");
  }
};

/**
 * Update booking
 */
export const updateBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;
    const updateData = req.body;

    // Get existing booking to check permissions
    const existingBooking = await BookingService.getBookingById(id);
    if (!existingBooking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    // Check if user has permission to update this booking
    const isOwner =
      existingBooking.user._id.toString() === req.user._id.toString();
    const hotel = await HotelService.getHotelByOwner(req.user._id);
    const isHotelOwner =
      hotel && hotel._id.toString() === existingBooking.hotel._id.toString();

    if (!isOwner && !isHotelOwner) {
      return ResponseHelper.forbidden(
        res,
        "You don't have permission to update this booking"
      );
    }

    // Convert date strings to Date objects if present
    if (updateData.checkInDate) {
      updateData.checkInDate = new Date(updateData.checkInDate);
    }
    if (updateData.checkOutDate) {
      updateData.checkOutDate = new Date(updateData.checkOutDate);
    }

    const booking = await BookingService.updateBooking(id, updateData);

    if (!booking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    return ResponseHelper.success(res, booking, "Booking updated successfully");
  } catch (error: any) {
    logger.error("Update booking error:", error);

    if (error.message === "Invalid booking ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to update booking");
  }
};

/**
 * Cancel booking
 */
export const cancelBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return ResponseHelper.validationError(res, [
        { msg: "Cancellation reason is required" },
      ]);
    }

    // Get existing booking to check permissions
    const existingBooking = await BookingService.getBookingById(id);
    if (!existingBooking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    // Check if user has permission to cancel this booking
    const isOwner =
      existingBooking.user._id.toString() === req.user._id.toString();
    const hotel = await HotelService.getHotelByOwner(req.user._id);
    const isHotelOwner =
      hotel && hotel._id.toString() === existingBooking.hotel._id.toString();

    if (!isOwner && !isHotelOwner) {
      return ResponseHelper.forbidden(
        res,
        "You don't have permission to cancel this booking"
      );
    }

    const booking = await BookingService.cancelBooking(id, reason);

    if (!booking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    return ResponseHelper.success(
      res,
      booking,
      "Booking cancelled successfully"
    );
  } catch (error: any) {
    logger.error("Cancel booking error:", error);

    if (
      error.message === "Invalid booking ID" ||
      error.message === "Booking is already cancelled" ||
      error.message === "Cannot cancel completed booking"
    ) {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to cancel booking");
  }
};

/**
 * Confirm booking (for hotel owners)
 */
export const confirmBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;

    // Get existing booking to check permissions
    const existingBooking = await BookingService.getBookingById(id);
    if (!existingBooking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    // Only hotel owners can confirm bookings
    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (
      !hotel ||
      hotel._id.toString() !== existingBooking.hotel._id.toString()
    ) {
      return ResponseHelper.forbidden(
        res,
        "Only hotel owners can confirm bookings"
      );
    }

    const booking = await BookingService.confirmBooking(id);

    if (!booking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    return ResponseHelper.success(
      res,
      booking,
      "Booking confirmed successfully"
    );
  } catch (error: any) {
    logger.error("Confirm booking error:", error);

    if (
      error.message === "Invalid booking ID" ||
      error.message === "Only pending bookings can be confirmed"
    ) {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to confirm booking");
  }
};

/**
 * Complete booking (for hotel owners)
 */
export const completeBooking = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;

    // Get existing booking to check permissions
    const existingBooking = await BookingService.getBookingById(id);
    if (!existingBooking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    // Only hotel owners can complete bookings
    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (
      !hotel ||
      hotel._id.toString() !== existingBooking.hotel._id.toString()
    ) {
      return ResponseHelper.forbidden(
        res,
        "Only hotel owners can complete bookings"
      );
    }

    const booking = await BookingService.completeBooking(id);

    if (!booking) {
      return ResponseHelper.notFound(res, "Booking not found");
    }

    return ResponseHelper.success(
      res,
      booking,
      "Booking completed successfully"
    );
  } catch (error: any) {
    logger.error("Complete booking error:", error);

    if (
      error.message === "Invalid booking ID" ||
      error.message === "Only confirmed bookings can be completed"
    ) {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to complete booking");
  }
};

/**
 * Get booking statistics (for hotel owners)
 */
export const getBookingStatistics = async (
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
        "You must own a hotel to view statistics"
      );
    }

    const stats = await BookingService.getBookingStatistics(
      hotel._id.toString()
    );

    return ResponseHelper.success(
      res,
      stats,
      "Booking statistics retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get booking statistics error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve booking statistics");
  }
};

/**
 * Get upcoming check-ins (for hotel owners)
 */
export const getUpcomingCheckIns = async (
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
        "You must own a hotel to view check-ins"
      );
    }

    const days = parseInt(req.query.days as string) || 7;
    const checkIns = await BookingService.getUpcomingCheckIns(
      hotel._id.toString(),
      days
    );

    return ResponseHelper.success(
      res,
      checkIns,
      "Upcoming check-ins retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get upcoming check-ins error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve upcoming check-ins");
  }
};

/**
 * Get upcoming check-outs (for hotel owners)
 */
export const getUpcomingCheckOuts = async (
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
        "You must own a hotel to view check-outs"
      );
    }

    const days = parseInt(req.query.days as string) || 7;
    const checkOuts = await BookingService.getUpcomingCheckOuts(
      hotel._id.toString(),
      days
    );

    return ResponseHelper.success(
      res,
      checkOuts,
      "Upcoming check-outs retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get upcoming check-outs error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve upcoming check-outs");
  }
};
