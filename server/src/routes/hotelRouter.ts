import { registerHotel } from "@/controllers/hotelController";
import { protect } from "@/middleware/auth";
import express from "express";

const hotelRouter = express.Router();

hotelRouter.post("/", protect, registerHotel);

export default hotelRouter;
