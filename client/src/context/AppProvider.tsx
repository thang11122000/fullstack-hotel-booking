import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import type { AppContextType } from "./app.types";
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

  const fetchUser = useCallback(async () => {
    if (!user) return;

    try {
      const token = await getToken();
      if (!token) {
        console.warn("Authentication token not available");
        return;
      }

      const { data } = await axios.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setIsOwner(data.role === "hotelOwner");
        setSearchedCities(data.recentSearchedCities || []);
      }
    } catch (error: any) {
      console.error("Failed to fetch user data:", error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch user data"
      );
    }
  }, [getToken, user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
