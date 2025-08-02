import {
  createRoom,
  getOwnerRooms,
  getRooms,
  toggleRoomAvailability,
} from "@/controllers/roomController";
import { protect } from "@/middleware/auth";
import upload from "@/middleware/upload";
import express from "express";

const roomRouter = express.Router();

roomRouter.post("/", upload.array("images", 4), protect, createRoom);
roomRouter.get("/", getRooms);
roomRouter.get("/owner", protect, getOwnerRooms);
roomRouter.post("/toggle-availability", protect, toggleRoomAvailability);

export default roomRouter;
