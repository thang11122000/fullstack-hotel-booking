// Validation utility functions

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | undefined;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export const validateField = (
  value: any,
  rules: ValidationRule
): string | undefined => {
  // Required validation
  if (
    rules.required &&
    (!value || (typeof value === "string" && !value.trim()))
  ) {
    return "This field is required";
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === "string" && !value.trim())) {
    return undefined;
  }

  // String validations
  if (typeof value === "string") {
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return "Invalid format";
    }
  }

  // Custom validation
  if (rules.custom) {
    return rules.custom(value);
  }

  return undefined;
};

export const validateForm = <T extends Record<string, any>>(
  values: T,
  rules: ValidationRules
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const fieldValue = values[field];
    const error = validateField(fieldValue, fieldRules);

    if (error) {
      errors[field as keyof T] = error;
    }
  });

  return errors;
};

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^\d+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

// Common validation rules
export const COMMON_RULES = {
  required: { required: true },
  email: {
    required: true,
    pattern: VALIDATION_PATTERNS.email,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.email.test(value)) {
        return "Please enter a valid email address";
      }
    },
  },
  phone: {
    required: true,
    pattern: VALIDATION_PATTERNS.phone,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.phone.test(value)) {
        return "Please enter a valid phone number";
      }
    },
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.password.test(value)) {
        return "Password must contain at least 8 characters with uppercase, lowercase, and number";
      }
    },
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.alphabetic,
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
} as const;

// Hotel-specific validation rules
export const HOTEL_VALIDATION_RULES: ValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
  },
  address: {
    required: true,
    minLength: 5,
    maxLength: 200,
  },
  contact: {
    required: true,
    pattern: VALIDATION_PATTERNS.phone,
    custom: (value: string) => {
      if (value && !VALIDATION_PATTERNS.phone.test(value)) {
        return "Please enter a valid contact number";
      }
    },
  },
  city: {
    required: true,
  },
};

// Room-specific validation rules
export const ROOM_VALIDATION_RULES: ValidationRules = {
  roomType: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  pricePerNight: {
    required: true,
    custom: (value: number) => {
      if (value <= 0) {
        return "Price must be greater than 0";
      }
      if (value > 10000) {
        return "Price seems too high";
      }
    },
  },
  maxGuests: {
    required: true,
    custom: (value: number) => {
      if (value < 1) {
        return "Must accommodate at least 1 guest";
      }
      if (value > 20) {
        return "Maximum 20 guests allowed";
      }
    },
  },
  description: {
    maxLength: 500,
  },
};

// Booking-specific validation rules
export const BOOKING_VALIDATION_RULES: ValidationRules = {
  checkInDate: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        return "Check-in date cannot be in the past";
      }
    },
  },
  checkOutDate: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date <= today) {
        return "Check-out date must be after today";
      }
    },
  },
  guests: {
    required: true,
    custom: (value: number) => {
      if (value < 1) {
        return "At least 1 guest is required";
      }
      if (value > 20) {
        return "Maximum 20 guests allowed";
      }
    },
  },
};
