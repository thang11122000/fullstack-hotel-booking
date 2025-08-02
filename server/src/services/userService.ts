import mongoose from "mongoose";
import User, { IUser } from "@/models/User";
import { logger } from "@/utils/logger";

export interface CreateUserData {
  username: string;
  email: string;
  image?: string;
  role?: "user" | "hotelOwner";
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  image?: string;
  role?: "user" | "hotelOwner";
  isActive?: boolean;
}

export interface UserQuery {
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserResponse {
  _id: string;
  username: string;
  email: string;
  image?: string;
  role: "user" | "hotelOwner";
  recentSearchedCities: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserData): Promise<IUser> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        email: userData.email.toLowerCase(),
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Create new user
      const user = await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
      });

      logger.info(`New user created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Get users with filtering and pagination
   */
  static async getUsers(query: UserQuery) {
    try {
      const {
        role,
        isActive,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = query;

      // Build filter query
      const filter: any = {};

      if (role) {
        filter.role = role;
      }

      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      if (search) {
        filter.$or = [
          { username: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ];
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      const sortOptions: any = {};
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        User.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting users:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(id);
      return user;
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      logger.error("Error getting user by email:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(
    id: string,
    updateData: UpdateUserData
  ): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (user) {
        logger.info(`User updated successfully: ${user._id}`);
      }

      return user;
    } catch (error) {
      logger.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (user) {
        logger.info(`User deactivated successfully: ${user._id}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Activate user
   */
  static async activateUser(id: string): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findByIdAndUpdate(
        id,
        { isActive: true },
        { new: true }
      );

      if (user) {
        logger.info(`User activated successfully: ${user._id}`);
      }

      return user;
    } catch (error) {
      logger.error("Error activating user:", error);
      throw error;
    }
  }

  /**
   * Update user's last login
   */
  static async updateLastLogin(id: string): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.updateLastLogin();
      return user;
    } catch (error) {
      logger.error("Error updating last login:", error);
      throw error;
    }
  }

  /**
   * Add recent searched city
   */
  static async addRecentSearchedCity(
    id: string,
    city: string
  ): Promise<IUser | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      await user.addRecentSearchedCity(city);
      return user;
    } catch (error) {
      logger.error("Error adding recent searched city:", error);
      throw error;
    }
  }

  /**
   * Get active users
   */
  static async getActiveUsers(): Promise<IUser[]> {
    try {
      const users = await User.findActiveUsers();
      return users;
    } catch (error) {
      logger.error("Error getting active users:", error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: string): Promise<IUser[]> {
    try {
      const users = await User.findByRole(role);
      return users;
    } catch (error) {
      logger.error("Error getting users by role:", error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStatistics() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            activeUsers: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            hotelOwners: {
              $sum: { $cond: [{ $eq: ["$role", "hotelOwner"] }, 1, 0] },
            },
            regularUsers: {
              $sum: { $cond: [{ $eq: ["$role", "user"] }, 1, 0] },
            },
          },
        },
      ]);

      return (
        stats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          hotelOwners: 0,
          regularUsers: 0,
        }
      );
    } catch (error) {
      logger.error("Error getting user statistics:", error);
      throw error;
    }
  }

  /**
   * Format user response (remove sensitive data)
   */
  static formatUserResponse(user: IUser): UserResponse {
    return {
      _id: user._id as string,
      username: user.username,
      email: user.email,
      image: user.image,
      role: user.role,
      recentSearchedCities: user.recentSearchedCities,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
