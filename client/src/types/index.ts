// Common types for the hotel booking application

export interface User {
  _id: string;
  username: string;
  email: string;
  image: string;
  role: "user" | "owner" | "admin" | "hotelOwner";
  createdAt: string;
  updatedAt: string;
  __v: number;
  recentSearchedCities?: string[];
}

export interface Hotel {
  _id: string;
  name: string;
  address: string;
  contact: string;
  owner: User;
  city: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Room {
  _id: string;
  images: string[];
  hotel: Hotel;
  roomType: string;
  pricePerNight: number;
  amenities: string[];
  description?: string;
  isAvailable?: boolean;
  maxGuests?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Booking {
  _id: string;
  user: User;
  room?: Room;
  hotel?: Hotel;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  isPaid?: boolean;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form types
export interface RoomFormData {
  roomType: string;
  pricePerNight: string;
  amenities: Record<string, boolean>;
  images: Record<string, File | null>;
  description?: string;
  maxGuests?: number;
}

export interface BookingFormData {
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

// Utility types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// UI Component Types
export interface ButtonProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
}

export interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export interface TitleProps {
  title: string;
  subTitle?: string;
  align?: "left" | "center" | "right";
  font?: string;
  className?: string;
}

export interface NavLink {
  name: string;
  path: string;
  icon?: string;
}

// Data Types
export interface ExclusiveOffer {
  _id?: number;
  title: string;
  description: string;
  priceOff?: number;
  image: string;
  expiryDate?: string;
}

export interface Testimonial {
  id: string | number;
  name: string;
  address?: string;
  image?: string;
  rating: number;
  review: string;
}

export interface RoomCommonData {
  title: string;
  description: string;
  icon: string;
}

export interface DashboardData {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate?: number;
  bookings: Booking[];
  recentBookings?: Booking[];
}
