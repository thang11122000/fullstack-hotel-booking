import { useCallback, useEffect, useState } from "react";
import { roomsDummyData } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import HotelCard from "./HotelCard";
import Title from "./Title";
import { useNavigate } from "react-router-dom";

const RecommendedHotels = () => {
  const { navigate, searchedCities, rooms } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  const filteredHotels = useCallback(() => {
    const hotel = rooms
      .slice()
      .filter((room) => searchedCities.includes(room.hotel.city));
    setRecommended(hotel);
  }, [rooms, searchedCities]);

  useEffect(() => {
    filteredHotels();
  }, [filteredHotels]);

  return (
    recommended.length > 0 && (
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
        <Title
          title={"Recommended Hotels"}
          subTitle={
            "Discover our handpicked selection of exceptional properties around the word, offering unparalleled luxury and unforgettable experiences."
          }
          align="center"
          font="font-playfair"
        />
        <div className="flex flex-wrap items-center justify-center gap-6 mt-20">
          {recommended.slice(0, 4).map((room, index) => (
            <HotelCard key={index} room={room} index={index}></HotelCard>
          ))}
        </div>
        <button
          onClick={() => {
            navigate("/rooms");
            scrollTo(0, 0);
          }}
          className="my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all cursor-pointer"
        >
          View All Destinations
        </button>
      </div>
    )
  );
};

export default RecommendedHotels;
