import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { ResponseHelper } from "../utils/response";
import { logger } from "../utils/logger";
import { HotelService, CreateHotelData } from "../services/hotelService";
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
