/**
 * Price utility functions for hotel booking application
 */

/**
 * Calculate total price for a booking
 */
export const calculateTotalPrice = (
  pricePerNight: number,
  checkInDate: Date,
  checkOutDate: Date,
  guests: number = 1
): number => {
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  let totalPrice = pricePerNight * nights;

  // Add extra guest charges (if more than 2 guests, charge 10% extra per additional guest)
  if (guests > 2) {
    const extraGuests = guests - 2;
    const extraGuestCharge = totalPrice * 0.1 * extraGuests;
    totalPrice += extraGuestCharge;
  }

  return Math.round(totalPrice * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate taxes (assuming 10% tax rate)
 */
export const calculateTaxes = (
  subtotal: number,
  taxRate: number = 0.1
): number => {
  return Math.round(subtotal * taxRate * 100) / 100;
};

/**
 * Calculate service fees (assuming 5% service fee)
 */
export const calculateServiceFee = (
  subtotal: number,
  feeRate: number = 0.05
): number => {
  return Math.round(subtotal * feeRate * 100) / 100;
};

/**
 * Calculate final total with taxes and fees
 */
export const calculateFinalTotal = (
  subtotal: number,
  taxRate: number = 0.1,
  serviceFeeRate: number = 0.05
): {
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
} => {
  const taxes = calculateTaxes(subtotal, taxRate);
  const serviceFee = calculateServiceFee(subtotal, serviceFeeRate);
  const total = subtotal + taxes + serviceFee;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxes: Math.round(taxes * 100) / 100,
    serviceFee: Math.round(serviceFee * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

/**
 * Apply discount to price
 */
export const applyDiscount = (
  originalPrice: number,
  discountPercentage: number
): {
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
} => {
  const discountAmount = (originalPrice * discountPercentage) / 100;
  const discountedPrice = originalPrice - discountAmount;

  return {
    originalPrice: Math.round(originalPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountedPrice: Math.round(discountedPrice * 100) / 100,
  };
};

/**
 * Format price for display with currency symbol
 */
export const formatPrice = (
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

/**
 * Calculate price per night based on room type
 */
export const calculatePricePerNight = (
  basePrice: number,
  roomType: string,
  seasonMultiplier: number = 1
): number => {
  let multiplier = 1;

  switch (roomType.toLowerCase()) {
    case "single":
      multiplier = 1;
      break;
    case "double":
      multiplier = 1.2;
      break;
    case "suite":
      multiplier = 1.8;
      break;
    case "deluxe":
      multiplier = 2.2;
      break;
    case "family":
      multiplier = 1.5;
      break;
    default:
      multiplier = 1;
  }

  return Math.round(basePrice * multiplier * seasonMultiplier * 100) / 100;
};

/**
 * Calculate seasonal pricing multiplier
 */
export const getSeasonalMultiplier = (date: Date): number => {
  const month = date.getMonth() + 1; // getMonth() returns 0-11

  // Peak season (June-August, December): 1.3x
  if ((month >= 6 && month <= 8) || month === 12) {
    return 1.3;
  }

  // High season (March-May, September-November): 1.1x
  if ((month >= 3 && month <= 5) || (month >= 9 && month <= 11)) {
    return 1.1;
  }

  // Low season (January-February): 0.8x
  return 0.8;
};

/**
 * Calculate weekend pricing (Friday-Sunday gets 20% markup)
 */
export const getWeekendMultiplier = (date: Date): number => {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  // Friday (5), Saturday (6), Sunday (0)
  if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
    return 1.2;
  }

  return 1;
};

/**
 * Calculate dynamic pricing based on various factors
 */
export const calculateDynamicPrice = (
  basePrice: number,
  roomType: string,
  checkInDate: Date,
  occupancyRate: number = 0.7 // 70% occupancy
): number => {
  let finalPrice = basePrice;

  // Apply room type multiplier
  finalPrice = calculatePricePerNight(finalPrice, roomType);

  // Apply seasonal multiplier
  const seasonalMultiplier = getSeasonalMultiplier(checkInDate);
  finalPrice *= seasonalMultiplier;

  // Apply weekend multiplier
  const weekendMultiplier = getWeekendMultiplier(checkInDate);
  finalPrice *= weekendMultiplier;

  // Apply occupancy-based pricing
  // High occupancy (>80%) = 1.2x, Low occupancy (<50%) = 0.9x
  let occupancyMultiplier = 1;
  if (occupancyRate > 0.8) {
    occupancyMultiplier = 1.2;
  } else if (occupancyRate < 0.5) {
    occupancyMultiplier = 0.9;
  }
  finalPrice *= occupancyMultiplier;

  return Math.round(finalPrice * 100) / 100;
};

/**
 * Calculate refund amount based on cancellation policy
 */
export const calculateRefundAmount = (
  totalPaid: number,
  checkInDate: Date,
  cancellationDate: Date = new Date()
): {
  refundAmount: number;
  refundPercentage: number;
  cancellationFee: number;
} => {
  const daysUntilCheckIn = Math.ceil(
    (checkInDate.getTime() - cancellationDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  let refundPercentage = 0;

  // Refund policy based on days before check-in
  if (daysUntilCheckIn >= 14) {
    refundPercentage = 100; // Full refund
  } else if (daysUntilCheckIn >= 7) {
    refundPercentage = 75; // 75% refund
  } else if (daysUntilCheckIn >= 3) {
    refundPercentage = 50; // 50% refund
  } else if (daysUntilCheckIn >= 1) {
    refundPercentage = 25; // 25% refund
  } else {
    refundPercentage = 0; // No refund
  }

  const refundAmount = (totalPaid * refundPercentage) / 100;
  const cancellationFee = totalPaid - refundAmount;

  return {
    refundAmount: Math.round(refundAmount * 100) / 100,
    refundPercentage,
    cancellationFee: Math.round(cancellationFee * 100) / 100,
  };
};

/**
 * Validate price range for search filters
 */
export const validatePriceRange = (
  minPrice?: number,
  maxPrice?: number
): {
  isValid: boolean;
  error?: string;
} => {
  if (minPrice !== undefined && minPrice < 0) {
    return {
      isValid: false,
      error: "Minimum price cannot be negative",
    };
  }

  if (maxPrice !== undefined && maxPrice < 0) {
    return {
      isValid: false,
      error: "Maximum price cannot be negative",
    };
  }

  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    return {
      isValid: false,
      error: "Minimum price cannot be greater than maximum price",
    };
  }

  return { isValid: true };
};
