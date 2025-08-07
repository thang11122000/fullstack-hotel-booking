import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { ResponseHelper } from "../utils/response";
import { logger } from "../utils/logger";
import { RoomService, CreateRoomData } from "../services/roomService";
import { HotelService } from "../services/hotelService";
import { validationResult } from "express-validator";
import cloudinary from "../lib/cloudinary";

/**
 * Create a new room
 */
export const createRoom = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const hotel = await HotelService.getHotelByOwner(req.user?._id);
    if (!hotel) {
      return ResponseHelper.forbidden(
        res,
        "You must own a hotel to create rooms"
      );
    }

    const { roomType, pricePerNight, amenities } = req.body;

    const files = Array.isArray(req.files) ? req.files : [];

    const uploadImages = files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path, {
        folder: "hotel-booking",
      });
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    const roomData: CreateRoomData = {
      hotel: hotel._id,
      roomType,
      pricePerNight: parseFloat(pricePerNight),
      amenities: JSON.parse(amenities),
      images: images,
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
    const rooms = await RoomService.getRooms();
    return ResponseHelper.success(res, rooms, "Rooms retrieved successfully");
  } catch (error) {
    logger.error("Get rooms error:", error);
    return ResponseHelper.error(res, "Failed to retrieve rooms");
  }
};

export const getOwnerRooms = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const hotel = await HotelService.getHotelByOwner(req.user?._id);

    if (!hotel) {
      return ResponseHelper.forbidden(
        res,
        "You must own a hotel to access your rooms"
      );
    }

    const rooms = await RoomService.getRoomsByHotel(hotel._id);
    return ResponseHelper.success(res, rooms, "Rooms retrieved successfully");
  } catch (error) {
    logger.error("Get rooms error:", error);
    return ResponseHelper.error(res, "Failed to retrieve rooms");
  }
};

/**
 * Update room
 */
// export const updateRoom = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response> => {
//   try {
//     // Check validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return ResponseHelper.validationError(res, errors.array());
//     }

//     const { id } = req.params;
//     const updateData = req.body;

//     // Verify user owns the hotel that owns this room
//     const room = await RoomService.getRoomById(id);
//     if (!room) {
//       return ResponseHelper.notFound(res, "Room not found");
//     }

//     const hotel = await HotelService.getHotelByOwner(req.user._id);
//     if (!hotel || hotel._id.toString() !== room.hotel._id.toString()) {
//       return ResponseHelper.forbidden(
//         res,
//         "You can only update rooms in your own hotel"
//       );
//     }

//     const updatedRoom = await RoomService.updateRoom(id, updateData);

//     if (!updatedRoom) {
//       return ResponseHelper.notFound(res, "Room not found");
//     }

//     return ResponseHelper.success(
//       res,
//       updatedRoom,
//       "Room updated successfully"
//     );
//   } catch (error: any) {
//     logger.error("Update room error:", error);

//     if (error.message === "Invalid room ID") {
//       return ResponseHelper.validationError(res, [{ msg: error.message }]);
//     }

//     return ResponseHelper.error(res, "Failed to update room");
//   }
// };

/**
 * Delete room
 */
// export const deleteRoom = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { id } = req.params;

//     // Verify user owns the hotel that owns this room
//     const room = await RoomService.getRoomById(id);
//     if (!room) {
//       return ResponseHelper.notFound(res, "Room not found");
//     }

//     const hotel = await HotelService.getHotelByOwner(req.user._id);
//     if (!hotel || hotel._id.toString() !== room.hotel._id.toString()) {
//       return ResponseHelper.forbidden(
//         res,
//         "You can only delete rooms in your own hotel"
//       );
//     }

//     const deleted = await RoomService.deleteRoom(id);

//     if (!deleted) {
//       return ResponseHelper.notFound(res, "Room not found");
//     }

//     return ResponseHelper.success(res, null, "Room deleted successfully");
//   } catch (error: any) {
//     logger.error("Delete room error:", error);

//     if (error.message === "Invalid room ID") {
//       return ResponseHelper.validationError(res, [{ msg: error.message }]);
//     }

//     if (error.message === "Cannot delete room with active bookings") {
//       return ResponseHelper.conflict(res, error.message);
//     }

//     return ResponseHelper.error(res, "Failed to delete room");
//   }
// };

/**
 * Toggle room availability
 */
export const toggleRoomAvailability = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { roomId } = req.body;

    const updatedRoom = await RoomService.toggleRoomAvailability(roomId);

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
 * Get room statistics for hotel owner
 */
// export const getRoomStatistics = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<Response> => {
//   try {
//     // Verify user owns a hotel
//     const hotel = await HotelService.getHotelByOwner(req.user._id);
//     if (!hotel) {
//       return ResponseHelper.forbidden(
//         res,
//         "You must own a hotel to view statistics"
//       );
//     }

//     const stats = await RoomService.getRoomStatistics(hotel._id.toString());

//     return ResponseHelper.success(
//       res,
//       stats,
//       "Room statistics retrieved successfully"
//     );
//   } catch (error: any) {
//     logger.error("Get room statistics error:", error);

//     if (error.message === "Invalid hotel ID") {
//       return ResponseHelper.validationError(res, [{ msg: error.message }]);
//     }

//     return ResponseHelper.error(res, "Failed to retrieve room statistics");
//   }
// };
