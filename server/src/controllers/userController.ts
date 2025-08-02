import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "@/utils/response";
import { logger } from "@/utils/logger";

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
    const user = req.user;

    // Check if city already exists to avoid duplicates
    const existingIndex = user.recentSearchedCities.indexOf(recentSearchedCity);

    if (existingIndex > -1) {
      // Move existing city to the end (most recent)
      user.recentSearchedCities.splice(existingIndex, 1);
      user.recentSearchedCities.push(recentSearchedCity);
    } else {
      // Add new city
      if (user.recentSearchedCities.length >= 3) {
        user.recentSearchedCities.shift(); // Remove oldest
      }
      user.recentSearchedCities.push(recentSearchedCity);
    }

    await user.save();

    return ResponseHelper.success(
      res,
      {
        recentSearchedCities: user.recentSearchedCities,
      },
      "Recent search city updated successfully"
    );
  } catch (error) {
    logger.error("Store recent searched cities error:", error);
    return ResponseHelper.error(res, "Failed to update recent searched cities");
  }
};
