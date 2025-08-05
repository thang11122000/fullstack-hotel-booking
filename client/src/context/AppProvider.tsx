import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { AppContextType } from "./app.types";
import type { ApiResponse, Room, User } from "../types";
import { AppContext } from "./AppContext";

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showHotelReg, setShowHotelReg] = useState<boolean>(false);
  const [searchedCities, setSearchedCities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const fetchRooms = async (): Promise<void> => {
    try {
      const { data } = await axios.get<ApiResponse<Room[]>>("/api/rooms");
      if (data.success && data.data) {
        setRooms(data.data);
      } else {
        toast.error(data.message || "Failed to fetch rooms");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch rooms";
      toast.error(errorMessage);
      console.error("Fetch rooms error:", error);
    }
  };

  const fetchUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const token = await getToken();
      if (!token) {
        console.warn("Authentication token not available");
        return;
      }

      const { data } = await axios.get<ApiResponse<User>>("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.data) {
        const { role, recentSearchedCities } = data.data;
        setIsOwner(role === "hotelOwner");
        setSearchedCities(recentSearchedCities || []);
      } else {
        console.warn("Failed to fetch user data:", data.message);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch user data:", error);

      // More specific error handling
      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch user data";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred while fetching user data");
      }
    }
  }, [getToken, user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const value: AppContextType = {
    currency,
    navigate,
    user,
    getToken,
    isOwner,
    setIsOwner,
    axios,
    showHotelReg,
    setShowHotelReg,
    searchedCities,
    setSearchedCities,
    rooms,
    setRooms,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
