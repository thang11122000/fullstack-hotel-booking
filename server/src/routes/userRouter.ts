import {
  getUserData,
  storeRecentSearchedCities,
} from "@/controllers/userController";
import { protect } from "@/middleware/auth";
import express from "express";

const userRouter = express.Router();

userRouter.get("/", protect, getUserData);
userRouter.get("/store-recent-search", protect, storeRecentSearchedCities);

export default userRouter;
