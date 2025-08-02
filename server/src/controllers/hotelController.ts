import { Response } from "express";
import Hotel from "@/models/Hotel";
import User from "@/models/User";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "@/utils/response";
import { logger } from "@/utils/logger";

export const registerHotel = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    // Check if user already has a hotel registered
    const existingHotel = await Hotel.findOne({ owner });

    if (existingHotel) {
      return ResponseHelper.conflict(
        res,
        "You have already registered a hotel"
      );
    }

    // Create new hotel
    const hotel = await Hotel.create({
      name,
      address,
      contact,
      city,
      owner,
    });

    // Update user role to hotel owner
    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    return ResponseHelper.created(
      res,
      {
        hotel: {
          id: hotel._id,
          name: hotel.name,
          address: hotel.address,
          contact: hotel.contact,
          city: hotel.city,
        },
      },
      "Hotel registered successfully"
    );
  } catch (error) {
    logger.error("Register hotel error:", error);
    return ResponseHelper.error(res, "Failed to register hotel");
  }
};

export const getHotelsByCity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    const { city } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = city ? { city: new RegExp(city as string, "i") } : {};

    const [hotels, total] = await Promise.all([
      Hotel.find(query)
        .populate("owner", "username email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Hotel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return ResponseHelper.paginated(
      res,
      hotels,
      {
        page,
        limit,
        total,
        totalPages,
      },
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

    const hotel = await Hotel.findOne({ owner: req.user._id }).populate(
      "owner",
      "username email"
    );

    if (!hotel) {
      return ResponseHelper.notFound(res, "No hotel found for this owner");
    }

    return ResponseHelper.success(res, hotel, "Hotel retrieved successfully");
  } catch (error) {
    logger.error("Get owner hotel error:", error);
    return ResponseHelper.error(res, "Failed to retrieve hotel");
  }
};
