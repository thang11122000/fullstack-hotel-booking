import { Request, Response } from "express";
import { IUser } from "@/models/User";

// Extend Express Request interface to include user and auth
export interface AuthenticatedRequest extends Request {
  user?: IUser;
  auth?: {
    userId: string;
  };
  requestId?: string;
  rawBody?: Buffer;
}

// Standard API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Controller function type
export type ControllerFunction = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<Response | void>;

// Pagination interface
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Search query interface
export interface SearchQuery extends PaginationQuery {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
}
