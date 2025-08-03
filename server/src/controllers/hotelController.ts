import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { ResponseHelper } from "../utils/response";
import { logger } from "../utils/logger";
import {
  HotelService,
  CreateHotelData,
  HotelQuery,
} from "../services/hotelService";
import { validationResult } from "express-validator";

export const registerHotel = async (
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

    const { name, address, contact, city } = req.body;
    const hotelData: CreateHotelData = {
      name,
      address,
      contact,
      city,
      owner: req.user._id,
    };

    const hotel = await HotelService.createHotel(hotelData);

    return ResponseHelper.created(
      res,
      {
        hotel: {
          id: hotel._id,
          name: hotel.name,
          address: hotel.address,
          contact: hotel.contact,
          city: hotel.city,
          createdAt: hotel.createdAt,
        },
      },
      "Hotel registered successfully"
    );
  } catch (error: any) {
    logger.error("Register hotel error:", error);

    if (error.message === "User already has a registered hotel") {
      return ResponseHelper.conflict(res, error.message);
    }

    return ResponseHelper.error(res, "Failed to register hotel");
  }
};

export const getHotelsByCity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const query: HotelQuery = {
      city: req.query.city as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: (req.query.sortBy as string) || "createdAt",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    };

    const result = await HotelService.getHotels(query);

    return ResponseHelper.paginated(
      res,
      result.hotels,
      result.pagination,
      "Hotels retrieved successfully"
    );
  } catch (error) {
    logger.error("Get hotels by city error:", error);
    return ResponseHelper.error(res, "Failed to retrieve hotels");
  }
};

export const getOwnerHotel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const hotel = await HotelService.getHotelByOwner(req.user._id);

    if (!hotel) {
      return ResponseHelper.notFound(res, "No hotel found for this owner");
    }

    return ResponseHelper.success(res, hotel, "Hotel retrieved successfully");
  } catch (error) {
    logger.error("Get owner hotel error:", error);
    return ResponseHelper.error(res, "Failed to retrieve hotel");
  }
};

/**
 * Get hotel by ID
 */
export const getHotelById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const hotel = await HotelService.getHotelById(id);

    if (!hotel) {
      return ResponseHelper.notFound(res, "Hotel not found");
    }

    return ResponseHelper.success(res, hotel, "Hotel retrieved successfully");
  } catch (error: any) {
    logger.error("Get hotel by ID error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve hotel");
  }
};

/**
 * Update hotel
 */
export const updateHotel = async (
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

    // Verify user owns the hotel
    const existingHotel = await HotelService.getHotelByOwner(req.user._id);
    if (!existingHotel || existingHotel._id.toString() !== id) {
      return ResponseHelper.forbidden(
        res,
        "You can only update your own hotel"
      );
    }

    const hotel = await HotelService.updateHotel(id, updateData);

    if (!hotel) {
      return ResponseHelper.notFound(res, "Hotel not found");
    }

    return ResponseHelper.success(res, hotel, "Hotel updated successfully");
  } catch (error: any) {
    logger.error("Update hotel error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to update hotel");
  }
};

/**
 * Delete hotel
 */
export const deleteHotel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;
    const deleted = await HotelService.deleteHotel(id, req.user._id);

    if (!deleted) {
      return ResponseHelper.notFound(
        res,
        "Hotel not found or you don't have permission"
      );
    }

    return ResponseHelper.success(res, null, "Hotel deleted successfully");
  } catch (error: any) {
    logger.error("Delete hotel error:", error);

    if (error.message === "Invalid hotel ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to delete hotel");
  }
};

/**
 * Search hotels
 */
export const searchHotels = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { q: searchTerm, limit } = req.query;

    if (!searchTerm) {
      return ResponseHelper.validationError(res, [
        { msg: "Search term is required" },
      ]);
    }

    const hotels = await HotelService.searchHotels(
      searchTerm as string,
      parseInt(limit as string) || 10
    );

    return ResponseHelper.success(res, hotels, "Hotels search completed");
  } catch (error) {
    logger.error("Search hotels error:", error);
    return ResponseHelper.error(res, "Failed to search hotels");
  }
};
