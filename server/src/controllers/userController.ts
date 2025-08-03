import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "../utils/response";
import { validationResult } from "express-validator";
import { logger } from "../utils/logger";
import { UserService } from "../services/userService";

export const getUserData = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { role, recentSearchedCities } = req.user;

    return ResponseHelper.success(
      res,
      {
        role,
        recentSearchedCities,
      },
      "User data retrieved successfully"
    );
  } catch (error) {
    logger.error("Get user data error:", error);
    return ResponseHelper.error(res, "Failed to retrieve user data");
  }
};

export const storeRecentSearchedCities = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { recentSearchedCity } = req.body;

    const updatedUser = await UserService.addRecentSearchedCity(
      req.user._id.toString(),
      recentSearchedCity.trim()
    );

    if (!updatedUser) {
      return ResponseHelper.notFound(res, "User not found");
    }

    return ResponseHelper.success(
      res,
      { recentSearchedCities: updatedUser.recentSearchedCities },
      "Recent search city updated successfully"
    );
  } catch (error) {
    logger.error("Store recent searched cities error:", error);
    return ResponseHelper.error(res, "Failed to update recent searched cities");
  }
};
