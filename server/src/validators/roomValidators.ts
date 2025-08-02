import { body, param, query } from "express-validator";

export const createRoomValidation = [
  body("roomType")
    .isIn(["single", "double", "suite", "deluxe", "family"])
    .withMessage(
      "Room type must be one of: single, double, suite, deluxe, family"
    ),

  body("pricePerNight")
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Price per night must be between 0 and 10,000"),

  body("maxGuests")
    .isInt({ min: 1, max: 10 })
    .withMessage("Maximum guests must be between 1 and 10"),

  body("amenities")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Amenities must be an array with maximum 20 items"),

  body("amenities.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each amenity must be between 1 and 50 characters"),

  body("images")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Images must be an array with maximum 10 items"),

  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),
];

export const updateRoomValidation = [
  body("roomType")
    .optional()
    .isIn(["single", "double", "suite", "deluxe", "family"])
    .withMessage(
      "Room type must be one of: single, double, suite, deluxe, family"
    ),

  body("pricePerNight")
    .optional()
    .isFloat({ min: 0, max: 10000 })
    .withMessage("Price per night must be between 0 and 10,000"),

  body("maxGuests")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Maximum guests must be between 1 and 10"),

  body("amenities")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Amenities must be an array with maximum 20 items"),

  body("amenities.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each amenity must be between 1 and 50 characters"),

  body("images")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Images must be an array with maximum 10 items"),

  body("images.*")
    .optional()
    .isURL()
    .withMessage("Each image must be a valid URL"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),
];

export const roomIdValidation = [
  param("id").isMongoId().withMessage("Invalid room ID"),
];

export const hotelIdValidation = [
  param("hotelId").isMongoId().withMessage("Invalid hotel ID"),
];

export const roomQueryValidation = [
  query("hotel").optional().isMongoId().withMessage("Invalid hotel ID"),

  query("roomType")
    .optional()
    .isIn(["single", "double", "suite", "deluxe", "family"])
    .withMessage("Invalid room type"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum price must be a positive number"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum price must be a positive number"),

  query("maxGuests")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Maximum guests must be between 1 and 10"),

  query("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),

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
    .isIn(["roomType", "pricePerNight", "maxGuests", "createdAt", "updatedAt"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

export const availabilityCheckValidation = [
  query("checkIn")
    .isISO8601()
    .withMessage("Check-in date must be a valid date"),

  query("checkOut")
    .isISO8601()
    .withMessage("Check-out date must be a valid date"),
];

export const searchAvailableRoomsValidation = [
  query("checkIn")
    .isISO8601()
    .withMessage("Check-in date must be a valid date"),

  query("checkOut")
    .isISO8601()
    .withMessage("Check-out date must be a valid date"),

  query("guests")
    .isInt({ min: 1, max: 10 })
    .withMessage("Number of guests must be between 1 and 10"),

  query("hotel").optional().isMongoId().withMessage("Invalid hotel ID"),
];
