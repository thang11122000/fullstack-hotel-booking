/**
 * Date utility functions for hotel booking application
 */

/**
 * Check if a date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Check if a date is tomorrow
 */
export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

/**
 * Get the number of days between two dates
 */
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDifference = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDifference / (1000 * 3600 * 24));
};

/**
 * Get the number of nights between check-in and check-out dates
 */
export const getNightsBetween = (checkIn: Date, checkOut: Date): number => {
  return getDaysBetween(checkIn, checkOut);
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateToString = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Parse date string to Date object
 */
export const parseDateString = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Check if two date ranges overlap
 */
export const doDateRangesOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

/**
 * Get start of day (00:00:00)
 */
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get end of day (23:59:59)
 */
export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Subtract days from a date
 */
export const subtractDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

/**
 * Get the first day of the month
 */
export const getFirstDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the last day of the month
 */
export const getLastDayOfMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Check if check-in and check-out dates are valid for booking
 */
export const validateBookingDates = (
  checkIn: Date,
  checkOut: Date
): {
  isValid: boolean;
  error?: string;
} => {
  // Check if check-in is in the past
  if (isPastDate(checkIn)) {
    return {
      isValid: false,
      error: "Check-in date cannot be in the past",
    };
  }

  // Check if check-out is before or same as check-in
  if (checkOut <= checkIn) {
    return {
      isValid: false,
      error: "Check-out date must be after check-in date",
    };
  }

  // Check if booking is too far in the future (e.g., more than 2 years)
  const maxAdvanceBookingDays = 730; // 2 years
  const daysBetween = getDaysBetween(new Date(), checkIn);
  if (daysBetween > maxAdvanceBookingDays) {
    return {
      isValid: false,
      error: "Booking cannot be made more than 2 years in advance",
    };
  }

  // Check if stay is too long (e.g., more than 30 days)
  const maxStayDays = 30;
  const stayDuration = getNightsBetween(checkIn, checkOut);
  if (stayDuration > maxStayDays) {
    return {
      isValid: false,
      error: "Maximum stay duration is 30 nights",
    };
  }

  return { isValid: true };
};

/**
 * Format date for display (e.g., "Jan 15, 2024")
 */
export const formatDateForDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Format date range for display (e.g., "Jan 15 - Jan 20, 2024")
 */
export const formatDateRangeForDisplay = (
  startDate: Date,
  endDate: Date
): string => {
  const start = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const end = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // If same year, don't repeat the year
  if (startDate.getFullYear() === endDate.getFullYear()) {
    return `${start} - ${end}`;
  }

  const startWithYear = startDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `${startWithYear} - ${end}`;
};

/**
 * Get upcoming dates within a specified number of days
 */
export const getUpcomingDates = (days: number): Date[] => {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    dates.push(addDays(today, i));
  }

  return dates;
};

/**
 * Check if a date falls within a date range
 */
export const isDateInRange = (
  date: Date,
  startDate: Date,
  endDate: Date
): boolean => {
  return date >= startDate && date <= endDate;
};
