// Base types
export interface BaseEntity {
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// User types
export interface User extends BaseEntity {
  username: string;
  email: string;
  image: string;
  role: "user" | "hotelOwner";
  recentSearchedCities?: string[];
}

// Hotel types
export interface Hotel extends BaseEntity {
  name: string;
  address: string;
  contact: string;
  owner: User;
  city: string;
}

// Room types
export type RoomType = "Single Bed" | "Double Bed" | "Suite" | "Deluxe";
export type AmenityType =
  | "Free WiFi"
  | "Free Breakfast"
  | "Room Service"
  | "Mountain View"
  | "Pool Access";

export interface Room extends BaseEntity {
  hotel: Hotel;
  roomType: RoomType;
  pricePerNight: number;
  amenities: AmenityType[];
  images: string[];
  isAvailable: boolean;
}

// Booking types
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentMethod = "Stripe" | "Pay At Hotel";

export interface Booking extends BaseEntity {
  user: User;
  room: Room;
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  guests: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
}

// Offer types
export interface ExclusiveOffer {
  _id: number;
  title: string;
  description: string;
  priceOff: number;
  expiryDate: string;
  image: string;
}

// Testimonial types
export interface Testimonial {
  id: number;
  name: string;
  address: string;
  image: string;
  rating: number;
  review: string;
}

// Dashboard types
export interface DashboardData {
  totalBookings: number;
  totalRevenue: number;
  bookings: Booking[];
}

// Common UI types
export interface NavLink {
  name: string;
  path: string;
}

export interface RoomCommonData {
  icon: string;
  title: string;
  description: string;
}

// Component props types
export interface TitleProps {
  align?: "left" | "center" | "right";
  font?: string;
  title: string;
  subTitle?: string;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}
