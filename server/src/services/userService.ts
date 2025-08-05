import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import { logger } from "../utils/logger";

export class UserService {
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
}
