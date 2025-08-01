import type { NavLink } from "../types";

export const NAV_LINKS: NavLink[] = [
  { name: "Home", path: "/" },
  { name: "Hotels", path: "/rooms" },
  { name: "Experience", path: "/" },
  { name: "About", path: "/" },
];

export const ROUTES = {
  HOME: "/",
  ROOMS: "/rooms",
  ROOM_DETAIL: "/rooms/:id",
  MY_BOOKINGS: "/my-bookings",
  OWNER_DASHBOARD: "/owner",
  OWNER_ADD_ROOM: "/owner/add-room",
  OWNER_LIST_ROOM: "/owner/list-room",
} as const;
