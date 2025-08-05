import {
  createBooking,
  getHotelBookings,
  getUserBookings,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  confirmBooking,
  checkAvailability,
} from "../controllers/bookingController";
import { protect } from "../middleware/auth";
import express from "express";

const bookingRouter = express.Router();

bookingRouter.post("/book", protect, createBooking);
bookingRouter.get("/user", protect, getUserBookings);
bookingRouter.get("/hotel", protect, getHotelBookings);
bookingRouter.post("/check-availability", checkAvailability);

// bookingRouter.get("/", protect, getBookings);
// bookingRouter.get("/:id", protect, getBookingById);
// bookingRouter.put("/:id", protect, updateBooking);
// bookingRouter.delete("/:id", protect, cancelBooking);
// bookingRouter.patch("/:id/confirm", protect, confirmBooking);

export default bookingRouter;
