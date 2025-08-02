import { body, param, query } from "express-validator";

export const createBookingValidation = [
  body("room").isMongoId().withMessage("Invalid room ID"),

  body("hotel").isMongoId().withMessage("Invalid hotel ID"),

  body("checkInDate")
    .isISO8601()
    .withMessage("Check-in date must be a valid date")
    .custom((value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new Error("Check-in date cannot be in the past");
      }
      return true;
    }),

  body("checkOutDate")
    .isISO8601()
    .withMessage("Check-out date must be a valid date")
    .custom((value, { req }) => {
      const checkOutDate = new Date(value);
      const checkInDate = new Date(req.body.checkInDate);

      if (checkOutDate <= checkInDate) {
        throw new Error("Check-out date must be after check-in date");
      }
      return true;
    }),

  body("guests")
    .isInt({ min: 1, max: 10 })
    .withMessage("Number of guests must be between 1 and 10"),

  body("paymentMethod")
    .optional()
    .isIn(["Pay At Hotel", "Credit Card", "PayPal", "Bank Transfer"])
    .withMessage("Invalid payment method"),

  body("specialRequests")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requests cannot exceed 500 characters"),
];

export const updateBookingValidation = [
  body("checkInDate")
    .optional()
    .isISO8601()
    .withMessage("Check-in date must be a valid date")
    .custom((value) => {
      const checkInDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        throw new Error("Check-in date cannot be in the past");
      }
      return true;
    }),

  body("checkOutDate")
    .optional()
    .isISO8601()
    .withMessage("Check-out date must be a valid date"),

  body("guests")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Number of guests must be between 1 and 10"),

  body("paymentMethod")
    .optional()
    .isIn(["Pay At Hotel", "Credit Card", "PayPal", "Bank Transfer"])
    .withMessage("Invalid payment method"),

  body("specialRequests")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Special requests cannot exceed 500 characters"),

  body("isPaid").optional().isBoolean().withMessage("isPaid must be a boolean"),
];

export const cancelBookingValidation = [
  body("reason")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Cancellation reason must be between 1 and 200 characters"),
];

export const bookingIdValidation = [
  param("id").isMongoId().withMessage("Invalid booking ID"),
];

export const bookingQueryValidation = [
  query("user").optional().isMongoId().withMessage("Invalid user ID"),

  query("hotel").optional().isMongoId().withMessage("Invalid hotel ID"),

  query("room").optional().isMongoId().withMessage("Invalid room ID"),

  query("status")
    .optional()
    .isIn(["pending", "confirmed", "cancelled", "completed"])
    .withMessage("Invalid booking status"),

  query("checkInDate")
    .optional()
    .isISO8601()
    .withMessage("Check-in date must be a valid date"),

  query("checkOutDate")
    .optional()
    .isISO8601()
    .withMessage("Check-out date must be a valid date"),

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
      "checkInDate",
      "checkOutDate",
      "totalPrice",
      "status",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be 'asc' or 'desc'"),
];

export const upcomingQueryValidation = [
  query("days")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Days must be between 1 and 30"),
];
