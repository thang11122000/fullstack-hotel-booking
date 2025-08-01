import Navbar from "./components/Navbar";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import AllRooms from "./pages/AllRooms";
import RoomDetail from "./pages/RoomDetail";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import MyBooking from "./pages/MyBooking";
import DashBoard from "./pages/hotelOwner/DashBoard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");

  return (
    <div>
      {!isOwnerPath && <Navbar />}
      {/* <HotelReg /> */}
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
