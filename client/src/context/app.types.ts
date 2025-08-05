import type { AxiosInstance } from "axios";
import type { NavigateFunction } from "react-router-dom";
import type { UserResource } from "@clerk/types";
import type { Room } from "../types";

export interface AppContextType {
  currency: string;
  navigate: NavigateFunction;
  user: UserResource | null | undefined;
  getToken: () => Promise<string | null>;
  isOwner: boolean;
  setIsOwner: React.Dispatch<React.SetStateAction<boolean>>;
  axios: AxiosInstance;
  showHotelReg: boolean;
  setShowHotelReg: React.Dispatch<React.SetStateAction<boolean>>;
  searchedCities: string[];
  setSearchedCities: React.Dispatch<React.SetStateAction<string[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}
