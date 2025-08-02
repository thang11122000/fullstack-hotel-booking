import {
  checkAvailabilityAPI,
  createBookingAPI,
  getHotelBookings,
  getUserBookings,
} from "@/controllers/bookingController";
import { registerHotel } from "@/controllers/hotelController";
import { protect } from "@/middleware/auth";
import { create } from "domain";
import express from "express";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability", checkAvailabilityAPI);
bookingRouter.post("/book", protect, createBookingAPI);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);

export default bookingRouter;
