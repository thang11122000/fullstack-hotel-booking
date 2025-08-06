import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import HotelCard from "../../components/HotelCard";
import Title from "../../components/Title";
import type { Room } from "../../types";

interface RecommendedHotelsProps {
  maxHotels?: number;
  className?: string;
}

const RecommendedHotels: React.FC<RecommendedHotelsProps> = ({
  maxHotels = 4,
  className = "",
}) => {
  const { navigate, searchedCities, rooms } = useAppContext();
  const [recommended, setRecommended] = useState<Room[]>([]);

  // Memoize filtered hotels to avoid unnecessary recalculations
  const filteredHotels = useMemo(() => {
    if (!rooms.length || !searchedCities.length) {
      return [];
    }

    return rooms.filter((room) => searchedCities.includes(room.hotel.city));
  }, [rooms, searchedCities]);

  // Update recommended hotels when filtered hotels change
  useEffect(() => {
    setRecommended(filteredHotels);
  }, [filteredHotels]);

  // Handle navigation with proper scroll behavior
  const handleViewAllClick = useCallback(() => {
    navigate("/rooms");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [navigate]);

  // Don't render if no recommendations
  if (recommended.length === 0) {
    return null;
  }

  return (
    <section
      className={`flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20 ${className}`}
      aria-labelledby="recommended-hotels-title"
    >
      <Title
        title="Recommended Hotels"
        subTitle="Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences."
        align="center"
        font="font-playfair"
      />

      <div
        className="flex flex-wrap items-center justify-center gap-6 mt-20"
        role="list"
        aria-label="Recommended hotels"
      >
        {recommended.slice(0, maxHotels).map((room, index) => (
          <div key={room._id} role="listitem">
            <HotelCard room={room} index={index} />
          </div>
        ))}
      </div>

      <button
        onClick={handleViewAllClick}
        className="my-16 px-4 py-2 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-50 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        type="button"
        aria-label="View all hotel destinations"
      >
        View All Destinations
      </button>
    </section>
  );
};

export default RecommendedHotels;
