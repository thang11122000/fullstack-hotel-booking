import upload from "../middleware/upload";
import {
  createRoom,
  getRooms,
  toggleRoomAvailability,
  getOwnerRooms,
} from "../controllers/roomController";
import { protect } from "../middleware/auth";
import express from "express";

const roomRouter = express.Router();

roomRouter.post("/", protect, upload.array("images"), createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);

// roomRouter.get("/search", searchAvailableRooms);
// roomRouter.get("/statistics", protect, getRoomStatistics);
// roomRouter.get("/hotel/:hotelId", getRoomsByHotel);
// roomRouter.get("/hotel/:hotelId/available", getAvailableRoomsByHotel);
// roomRouter.get("/:id", getRoomById);
// roomRouter.put("/:id", protect, updateRoom);
// roomRouter.delete("/:id", protect, deleteRoom);
// roomRouter.post("/:id/toggle-availability", protect, toggleRoomAvailability);
// roomRouter.post("/check-availability", checkRoomAvailability);

export default roomRouter;
