import { Response, NextFunction } from "express";
import User from "@/models/User";
import { AuthenticatedRequest } from "@/types";
import { ResponseHelper } from "@/utils/response";
import { logger } from "@/utils/logger";

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const { userId } = req.auth || {};

    if (!userId) {
      return ResponseHelper.unauthorized(res, "Authentication required");
    }

    const user = await User.findById(userId);

    if (!user) {
      return ResponseHelper.unauthorized(res, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return ResponseHelper.error(res, "Authentication failed", 500);
  }
};

// Optional: Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Response | void => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return ResponseHelper.forbidden(res, "Insufficient permissions");
    }

    next();
  };
};
