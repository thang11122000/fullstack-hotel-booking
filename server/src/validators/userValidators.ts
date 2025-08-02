import { body, param, query } from "express-validator";

export const updateUserProfileValidation = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Username must be between 2 and 50 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("image").optional().isURL().withMessage("Image must be a valid URL"),
];

export const recentSearchedCityValidation = [
  body("recentSearchedCity")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("City name must be between 1 and 50 characters"),
];

export const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

export const userQueryValidation = [
  query("role")
    .optional()
    .isIn(["user", "hotelOwner"])
    .withMessage("Invalid user role"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn([
      "username",
      "email",
      "role",
      "createdAt",
      "updatedAt",
      "lastLoginAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];
