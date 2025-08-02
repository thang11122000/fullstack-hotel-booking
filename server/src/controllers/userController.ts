import { Response } from "express";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "@/utils/response";
import { logger } from "@/utils/logger";
import { UserService } from "@/services/userService";
import { validationResult } from "express-validator";

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
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ResponseHelper.validationError(res, errors.array());
    }

    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { recentSearchedCity } = req.body;

    if (!recentSearchedCity || typeof recentSearchedCity !== "string") {
      return ResponseHelper.validationError(res, [
        { msg: "Recent searched city is required and must be a string" },
      ]);
    }

    const updatedUser = await UserService.addRecentSearchedCity(
      req.user._id.toString(),
      recentSearchedCity.trim()
    );

    if (!updatedUser) {
      return ResponseHelper.notFound(res, "User not found");
    }

    return ResponseHelper.success(
      res,
      {
        recentSearchedCities: updatedUser.recentSearchedCities,
      },
      "Recent search city updated successfully"
    );
  } catch (error) {
    logger.error("Store recent searched cities error:", error);
    return ResponseHelper.error(res, "Failed to update recent searched cities");
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const userResponse = UserService.formatUserResponse(req.user);

    return ResponseHelper.success(
      res,
      userResponse,
      "User profile retrieved successfully"
    );
  } catch (error) {
    logger.error("Get user profile error:", error);
    return ResponseHelper.error(res, "Failed to retrieve user profile");
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
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

    const { username, email, image } = req.body;
    const updateData: any = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (image) updateData.image = image;

    const updatedUser = await UserService.updateUser(
      req.user._id.toString(),
      updateData
    );

    if (!updatedUser) {
      return ResponseHelper.notFound(res, "User not found");
    }

    const userResponse = UserService.formatUserResponse(updatedUser);

    return ResponseHelper.success(
      res,
      userResponse,
      "User profile updated successfully"
    );
  } catch (error: any) {
    logger.error("Update user profile error:", error);

    if (error.message === "Invalid user ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    if (error.message.includes("email already exists")) {
      return ResponseHelper.conflict(res, "Email already exists");
    }

    return ResponseHelper.error(res, "Failed to update user profile");
  }
};

/**
 * Get user by ID (admin only)
 */
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    const { id } = req.params;

    // Only allow users to get their own profile or admin functionality
    if (req.user._id.toString() !== id && req.user.role !== "admin") {
      return ResponseHelper.forbidden(
        res,
        "You can only access your own profile"
      );
    }

    const user = await UserService.getUserById(id);

    if (!user) {
      return ResponseHelper.notFound(res, "User not found");
    }

    const userResponse = UserService.formatUserResponse(user);

    return ResponseHelper.success(
      res,
      userResponse,
      "User retrieved successfully"
    );
  } catch (error: any) {
    logger.error("Get user by ID error:", error);

    if (error.message === "Invalid user ID") {
      return ResponseHelper.validationError(res, [{ msg: error.message }]);
    }

    return ResponseHelper.error(res, "Failed to retrieve user");
  }
};

/**
 * Update last login
 */
export const updateLastLogin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "User not authenticated");
    }

    await UserService.updateLastLogin(req.user._id.toString());

    return ResponseHelper.success(res, null, "Last login updated successfully");
  } catch (error) {
    logger.error("Update last login error:", error);
    return ResponseHelper.error(res, "Failed to update last login");
  }
};
