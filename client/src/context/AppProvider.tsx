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
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [showHotelReg, setShowHotelReg] = useState<boolean>(false);
  const [searchedCities, setSearchedCities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    // Don't fetch if Clerk is not loaded yet
    if (!userLoaded || !authLoaded) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        console.warn("Authentication token not available");
        setIsLoading(false);
        return;
      }

      const { data } = await axios.get<ApiResponse<User>>("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        if (data.data) {
          const { role, recentSearchedCities } = data.data;
          setIsOwner(role === "hotelOwner");
          setSearchedCities(recentSearchedCities || []);
        }
      }
    } catch (error: unknown) {
      console.error("Failed to fetch user data:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch user data";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [authLoaded, getToken, user, userLoaded]);

  // Set loading to false when Clerk is loaded and no user is present
  useEffect(() => {
    if (userLoaded && authLoaded && !user) {
      setIsLoading(false);
    }
  }, [userLoaded, authLoaded, user]);

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
    isLoading,
    setIsLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
