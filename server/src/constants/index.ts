/**
 * Application constants for hotel booking system
 */

// Room Types
export const ROOM_TYPES = {
  SINGLE: "single",
  DOUBLE: "double",
  SUITE: "suite",
  DELUXE: "deluxe",
  FAMILY: "family",
} as const;

export type RoomType = (typeof ROOM_TYPES)[keyof typeof ROOM_TYPES];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// User Roles
export const USER_ROLES = {
  USER: "user",
  HOTEL_OWNER: "hotelOwner",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Payment Methods
export const PAYMENT_METHODS = {
  PAY_AT_HOTEL: "Pay At Hotel",
  CREDIT_CARD: "Credit Card",
  PAYPAL: "PayPal",
  BANK_TRANSFER: "Bank Transfer",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Booking Constraints
export const BOOKING_CONSTRAINTS = {
  MAX_ADVANCE_BOOKING_DAYS: 730, // 2 years
  MAX_STAY_DURATION_DAYS: 30,
  MIN_STAY_DURATION_DAYS: 1,
  MAX_GUESTS_PER_ROOM: 10,
  MIN_GUESTS_PER_ROOM: 1,
} as const;

// Price Constraints
export const PRICE_CONSTRAINTS = {
  MIN_PRICE_PER_NIGHT: 0,
  MAX_PRICE_PER_NIGHT: 10000,
  DEFAULT_TAX_RATE: 0.1, // 10%
  DEFAULT_SERVICE_FEE_RATE: 0.05, // 5%
} as const;

// Room Type Multipliers
export const ROOM_TYPE_MULTIPLIERS = {
  [ROOM_TYPES.SINGLE]: 1,
  [ROOM_TYPES.DOUBLE]: 1.2,
  [ROOM_TYPES.SUITE]: 1.8,
  [ROOM_TYPES.DELUXE]: 2.2,
  [ROOM_TYPES.FAMILY]: 1.5,
} as const;

// Seasonal Multipliers
export const SEASONAL_MULTIPLIERS = {
  PEAK_SEASON: 1.3, // June-August, December
  HIGH_SEASON: 1.1, // March-May, September-November
  LOW_SEASON: 0.8, // January-February
} as const;

// Weekend Multiplier
export const WEEKEND_MULTIPLIER = 1.2;

// Occupancy-based Multipliers
export const OCCUPANCY_MULTIPLIERS = {
  HIGH_OCCUPANCY: 1.2, // >80%
  NORMAL_OCCUPANCY: 1, // 50-80%
  LOW_OCCUPANCY: 0.9, // <50%
} as const;

// Refund Policy (based on days before check-in)
export const REFUND_POLICY = {
  FULL_REFUND_DAYS: 14, // 100% refund
  PARTIAL_REFUND_75_DAYS: 7, // 75% refund
  PARTIAL_REFUND_50_DAYS: 3, // 50% refund
  PARTIAL_REFUND_25_DAYS: 1, // 25% refund
  NO_REFUND_DAYS: 0, // 0% refund
} as const;

export const REFUND_PERCENTAGES = {
  FULL: 100,
  PARTIAL_75: 75,
  PARTIAL_50: 50,
  PARTIAL_25: 25,
  NONE: 0,
} as const;

// Hotel Amenities
export const COMMON_AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "TV",
  "Mini Bar",
  "Room Service",
  "Balcony",
  "Sea View",
  "City View",
  "Bathtub",
  "Shower",
  "Hair Dryer",
  "Safe",
  "Telephone",
  "Desk",
  "Wardrobe",
  "Coffee/Tea Maker",
  "Refrigerator",
  "Microwave",
  "Iron",
  "Ironing Board",
] as const;

// Hotel Facilities
export const COMMON_FACILITIES = [
  "Swimming Pool",
  "Gym",
  "Spa",
  "Restaurant",
  "Bar",
  "Conference Room",
  "Business Center",
  "Parking",
  "Valet Parking",
  "Airport Shuttle",
  "Concierge",
  "24/7 Front Desk",
  "Laundry Service",
  "Room Service",
  "Pet Friendly",
  "Wheelchair Accessible",
  "Elevator",
  "Garden",
  "Terrace",
  "Library",
] as const;

// Search and Filter Constants
export const SEARCH_CONSTRAINTS = {
  MIN_SEARCH_TERM_LENGTH: 1,
  MAX_SEARCH_TERM_LENGTH: 100,
  MAX_RECENT_SEARCHES: 5,
} as const;

// Sort Options
export const SORT_OPTIONS = {
  HOTELS: {
    NAME: "name",
    CITY: "city",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
  },
  ROOMS: {
    ROOM_TYPE: "roomType",
    PRICE_PER_NIGHT: "pricePerNight",
    MAX_GUESTS: "maxGuests",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
  },
  BOOKINGS: {
    CHECK_IN_DATE: "checkInDate",
    CHECK_OUT_DATE: "checkOutDate",
    TOTAL_PRICE: "totalPrice",
    STATUS: "status",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
  },
  USERS: {
    USERNAME: "username",
    EMAIL: "email",
    ROLE: "role",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
    LAST_LOGIN_AT: "lastLoginAt",
  },
} as const;

export const SORT_ORDERS = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortOrder = (typeof SORT_ORDERS)[keyof typeof SORT_ORDERS];

// Validation Constants
export const VALIDATION_CONSTRAINTS = {
  USERNAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  EMAIL: {
    PATTERN: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },
  HOTEL_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
  },
  HOTEL_ADDRESS: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 200,
  },
  CITY_NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  PHONE_NUMBER: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
  SPECIAL_REQUESTS: {
    MAX_LENGTH: 500,
  },
  CANCELLATION_REASON: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  VALIDATION_ERROR: "Validation error",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource conflict",
  INTERNAL_ERROR: "Internal server error",
  INVALID_CREDENTIALS: "Invalid credentials",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",
  USER_NOT_FOUND: "User not found",
  HOTEL_NOT_FOUND: "Hotel not found",
  ROOM_NOT_FOUND: "Room not found",
  BOOKING_NOT_FOUND: "Booking not found",
  ROOM_NOT_AVAILABLE: "Room is not available for selected dates",
  BOOKING_ALREADY_CANCELLED: "Booking is already cancelled",
  CANNOT_CANCEL_COMPLETED_BOOKING: "Cannot cancel completed booking",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_DATE_RANGE: "Invalid date range",
  PAST_DATE_NOT_ALLOWED: "Past dates are not allowed",
  MAX_STAY_EXCEEDED: "Maximum stay duration exceeded",
  INVALID_GUEST_COUNT: "Invalid number of guests",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  HOTEL_CREATED: "Hotel created successfully",
  HOTEL_UPDATED: "Hotel updated successfully",
  HOTEL_DELETED: "Hotel deleted successfully",
  ROOM_CREATED: "Room created successfully",
  ROOM_UPDATED: "Room updated successfully",
  ROOM_DELETED: "Room deleted successfully",
  BOOKING_CREATED: "Booking created successfully",
  BOOKING_UPDATED: "Booking updated successfully",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  BOOKING_CONFIRMED: "Booking confirmed successfully",
  BOOKING_COMPLETED: "Booking completed successfully",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  PASSWORD_UPDATED: "Password updated successfully",
  PROFILE_UPDATED: "Profile updated successfully",
} as const;

// Cache Keys (if using caching)
export const CACHE_KEYS = {
  USER_PREFIX: "user:",
  HOTEL_PREFIX: "hotel:",
  ROOM_PREFIX: "room:",
  BOOKING_PREFIX: "booking:",
  SEARCH_PREFIX: "search:",
  STATS_PREFIX: "stats:",
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;
