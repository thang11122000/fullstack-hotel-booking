import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "../utils/response";
import { logger } from "@/utils/logger";
import {
  RoomService,
  CreateRoomData,
  RoomQuery,
  AvailabilityQuery,
} from "@/services/roomService";
import { HotelService } from "@/services/hotelService";
import { validationResult } from "express-validator";

/**
 * Create a new room
 */
export const createRoom = async (
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

    // Verify user owns the hotel
    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (!hotel) {
      return ResponseHelper.forbidden(
        res,
        "You must own a hotel to create rooms"
      );
    }

    const {
      roomType,
      pricePerNight,
      amenities,
      images,
      maxGuests,
      description,
    } = req.body;
    const roomData: CreateRoomData = {
      hotel: hotel._id,
      roomType,
      pricePerNight,
      amenities: amenities || [],
      images: images || [],
      maxGuests,
      description,
    };

    const room = await RoomService.createRoom(roomData);

    return ResponseHelper.created(res, room, "Room created successfully");
  } catch (error: any) {
    logger.error("Create room error:", error);
    return ResponseHelper.error(res, "Failed to create room");
  }
};

/**
 * Get rooms with filtering and pagination
 */
export const getRooms = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query: RoomQuery = {
      hotel: req.query.hotel as string,
      roomType: req.query.roomType as string,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
      maxGuests: req.query.maxGuests
        ? parseInt(req.query.maxGuests as string)
        : undefined,
      isAvailable: req.query.isAvailable
        ? req.query.isAvailable === "true"
        : undefined,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await RoomService.getRooms(query);

    return ResponseHelper.paginated(
      res,
      result.rooms,
      result.pagination,
      "Rooms retrieved successfully"
    );
  } catch (error) {
    logger.error("Get rooms error:", error);
    return ResponseHelper.error(res, "Failed to retrieve rooms");
  }
};

/**
 * Get room by ID
 */
export const getRoomById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const room = await RoomService.getRoomById(id);

    if (!room) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    return ResponseHelper.success(res, room, "Room retrieved successfully");
  } catch (error: any) {
    logger.error("Get room by ID error:", error);

    if (error.message === "Invalid room ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve room");
  }
};

/**
 * Get rooms by hotel
 */
export const getRoomsByHotel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { hotelId } = req.params;
    const rooms = await RoomService.getRoomsByHotel(hotelId);

    return ResponseHelper.success(
      res,
      rooms,
      "Hotel rooms retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get rooms by hotel error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve hotel rooms");
  }
};

/**
 * Get available rooms by hotel
 */
export const getAvailableRoomsByHotel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { hotelId } = req.params;
    const rooms = await RoomService.getAvailableRoomsByHotel(hotelId);

    return ResponseHelper.success(
      res,
      rooms,
      "Available hotel rooms retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get available rooms by hotel error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(
      res,
      "Failed to retrieve available hotel rooms"
    );
  }
};

/**
 * Update room
 */
export const updateRoom = async (
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

    // Verify user owns the hotel that owns this room
    const room = await RoomService.getRoomById(id);
    if (!room) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (!hotel || hotel._id.toString() !== room.hotel._id.toString()) {
      return ResponseHelper.forbidden(
        res,
        "You can only update rooms in your own hotel"
      );
    }

    const updatedRoom = await RoomService.updateRoom(id, updateData);

    if (!updatedRoom) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    return ResponseHelper.success(
      res,
      updatedRoom,
      "Room updated successfully"
    );
  } catch (error: any) {
    logger.error("Update room error:", error);

    if (error.message === "Invalid room ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to update room");
  }
};

/**
 * Delete room
 */
export const deleteRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;

    // Verify user owns the hotel that owns this room
    const room = await RoomService.getRoomById(id);
    if (!room) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (!hotel || hotel._id.toString() !== room.hotel._id.toString()) {
      return ResponseHelper.forbidden(
        res,
        "You can only delete rooms in your own hotel"
      );
    }

    const deleted = await RoomService.deleteRoom(id);

    if (!deleted) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    return ResponseHelper.success(res, null, "Room deleted successfully");
  } catch (error: any) {
    logger.error("Delete room error:", error);

    if (error.message === "Invalid room ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    if (error.message === "Cannot delete room with active bookings") {
      return ResponseHelper.conflict(res, error.message);
    }

    return ResponseHelper.error(res, "Failed to delete room");
  }
};

/**
 * Toggle room availability
 */
export const toggleRoomAvailability = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;

    // Verify user owns the hotel that owns this room
    const room = await RoomService.getRoomById(id);
    if (!room) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    const hotel = await HotelService.getHotelByOwner(req.user._id);
    if (!hotel || hotel._id.toString() !== room.hotel._id.toString()) {
      return ResponseHelper.forbidden(
        res,
        "You can only modify rooms in your own hotel"
      );
    }

    const updatedRoom = await RoomService.toggleRoomAvailability(id);

    if (!updatedRoom) {
      return ResponseHelper.notFound(res, "Room not found");
    }

    return ResponseHelper.success(
      res,
      updatedRoom,
      `Room availability ${
        updatedRoom.isAvailable ? "enabled" : "disabled"
      } successfully`
    );
  } catch (error: any) {
    logger.error("Toggle room availability error:", error);

    if (error.message === "Invalid room ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to toggle room availability");
  }
};

/**
 * Check room availability
 */
export const checkRoomAvailability = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return ResponseHelper.validationError(res, [
        { msg: "Check-in and check-out dates are required" },
      ]);
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (checkInDate >= checkOutDate) {
      return ResponseHelper.validationError(res, [
        { msg: "Check-out date must be after check-in date" },
      ]);
    }

    const isAvailable = await RoomService.checkAvailability(
      id,
      checkInDate,
      checkOutDate
    );

    return ResponseHelper.success(
      res,
      { isAvailable, checkIn: checkInDate, checkOut: checkOutDate },
      "Room availability checked successfully"
    );
  } catch (error: any) {
    logger.error("Check room availability error:", error);

    if (error.message === "Invalid room ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to check room availability");
  }
};

/**
 * Search available rooms
 */
export const searchAvailableRooms = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { checkIn, checkOut, guests, hotel } = req.query;

    if (!checkIn || !checkOut || !guests) {
      return ResponseHelper.validationError(res, [
        {
          msg: "Check-in date, check-out date, and number of guests are required",
        },
      ]);
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);
    const guestCount = parseInt(guests as string);

    if (checkInDate >= checkOutDate) {
      return ResponseHelper.validationError(res, [
        { msg: "Check-out date must be after check-in date" },
      ]);
    }

    if (guestCount < 1) {
      return ResponseHelper.validationError(res, [
        { msg: "Number of guests must be at least 1" },
      ]);
    }

    const query: AvailabilityQuery = {
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guestCount,
      hotel: hotel as string,
    };

    const rooms = await RoomService.searchAvailableRooms(query);

    return ResponseHelper.success(
      res,
      rooms,
      "Available rooms retrieved successfully"
    );
  } catch (error) {
    logger.error("Search available rooms error:", error);
    return ResponseHelper.error(res, "Failed to search available rooms");
  }
};

/**
 * Get room statistics for hotel owner
 */
export const getRoomStatistics = async (
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

    const stats = await RoomService.getRoomStatistics(hotel._id.toString());

    return ResponseHelper.success(
      res,
      stats,
      "Room statistics retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get room statistics error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve room statistics");
  }
};
