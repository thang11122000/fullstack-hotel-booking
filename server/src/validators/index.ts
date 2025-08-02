import Joi from "joi";

// User validation schemas
export const userValidation = {
  storeRecentSearch: Joi.object({
    recentSearchedCity: Joi.string().required().min(2).max(100).trim(),
  }),
};

// Hotel validation schemas
export const hotelValidation = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(200).trim(),
    address: Joi.string().required().min(10).max(500).trim(),
    contact: Joi.string()
      .required()
      .pattern(/^[0-9+\-\s()]+$/)
      .min(10)
      .max(20),
    city: Joi.string().required().min(2).max(100).trim(),
  }),
};

// Room validation schemas
export const roomValidation = {
  create: Joi.object({
    title: Joi.string().required().min(5).max(200).trim(),
    description: Joi.string().required().min(20).max(1000).trim(),
    price: Joi.number().required().min(0).max(10000),
    maxGuests: Joi.number().required().min(1).max(20),
    amenities: Joi.array().items(Joi.string().trim()).max(20),
    roomType: Joi.string()
      .valid("single", "double", "suite", "deluxe", "family")
      .required(),
  }),

  toggleAvailability: Joi.object({
    roomId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/),
    available: Joi.boolean().required(),
  }),
};

// Booking validation schemas
export const bookingValidation = {
  checkAvailability: Joi.object({
    roomId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/),
    checkIn: Joi.date().required().min("now"),
    checkOut: Joi.date().required().greater(Joi.ref("checkIn")),
  }),

  create: Joi.object({
    roomId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/),
    checkIn: Joi.date().required().min("now"),
    checkOut: Joi.date().required().greater(Joi.ref("checkIn")),
    guests: Joi.number().required().min(1).max(20),
    totalAmount: Joi.number().required().min(0),
    paymentMethod: Joi.string()
      .valid("card", "paypal", "bank_transfer")
      .required(),
  }),
};

// Query validation schemas
export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    sort: Joi.string()
      .valid("createdAt", "updatedAt", "price", "name", "rating")
      .default("createdAt"),
    order: Joi.string().valid("asc", "desc").default("desc"),
  }),

  search: Joi.object({
    search: Joi.string().trim().max(100),
    city: Joi.string().trim().max(100),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    checkIn: Joi.date().min("now"),
    checkOut: Joi.date().greater(Joi.ref("checkIn")),
  }).and("checkIn", "checkOut"),
};
