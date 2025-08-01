// Hotel room amenities constants

export const ROOM_AMENITIES = {
  FREE_WIFI: "Free Wifi",
  FREE_BREAKFAST: "Free Breakfast",
  ROOM_SERVICE: "Room Service",
  MOUNTAIN_VIEW: "Mountain View",
  POOL_ACCESS: "Pool Access",
  AIR_CONDITIONING: "Air Conditioning",
  MINI_BAR: "Mini Bar",
  BALCONY: "Balcony",
  PARKING: "Free Parking",
  GYM_ACCESS: "Gym Access",
} as const;

export const DEFAULT_AMENITIES = {
  [ROOM_AMENITIES.FREE_WIFI]: false,
  [ROOM_AMENITIES.FREE_BREAKFAST]: false,
  [ROOM_AMENITIES.ROOM_SERVICE]: false,
  [ROOM_AMENITIES.MOUNTAIN_VIEW]: false,
  [ROOM_AMENITIES.POOL_ACCESS]: false,
};

export const ROOM_TYPES = [
  "Single Bed",
  "Double Bed",
  "Luxury Room",
  "Family Suite",
  "Presidential Suite",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
export type AmenityKey = keyof typeof DEFAULT_AMENITIES;
