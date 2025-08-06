import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/home/Home";
import AllRooms from "./pages/rooms/AllRooms";
import RoomDetail from "./pages/rooms/RoomDetails";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/dashboard/Layout";
import DashBoard from "./pages/dashboard/DashBoard";
import AddRoom from "./pages/dashboard/AddRoom";
import ListRoom from "./pages/dashboard/ListRoom";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";
import MyBooking from "./pages/rooms/MyBooking";

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const { showHotelReg } = useAppContext();

  return (
    <div>
      <Toaster />
      {!isOwnerPath && <Navbar />}
      {showHotelReg && <HotelReg />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetail />} />
          <Route path="/my-bookings" element={<MyBooking />} />
          <Route path="/owner" element={<Layout />}>
            <Route index element={<DashBoard />}></Route>
            <Route path="add-room" element={<AddRoom />}></Route>
            <Route path="list-room" element={<ListRoom />}></Route>
          </Route>
        </Routes>
      </div>
    </div>
  );
};

export default App;
