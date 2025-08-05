import type axios from "axios";
import type { NavigateFunction } from "react-router-dom";

export interface AppContextType {
  currency: string;
  navigate: NavigateFunction;
  user: any;
  getToken: () => Promise<string | null>;
  isOwner: boolean;
  setIsOwner: (value: boolean) => void;
  axios: typeof axios;
  showHotelReg: boolean;
  setShowHotelReg: (value: boolean) => void;
  searchedCities: string[];
  setSearchedCities: (cities: string[]) => void;
  rooms: any[];
  setRooms: (rooms: any) => void;
}
