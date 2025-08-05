import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import type { Room } from "../types";

interface HotelCardProps {
  room: Room;
  index: number;
  className?: string;
  showBestSeller?: boolean;
  rating?: number;
}

const HotelCard = ({
  room,
  index,
  className = "",
  showBestSeller = true,
  rating = 4.5,
}: HotelCardProps) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isBestSeller = showBestSeller && index % 2 === 0;

  return (
    <Link
      to={`/room/${room._id}`}
      onClick={handleScrollToTop}
      className={`relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 ${className}`}
      aria-label={`View details for ${room.hotel.name}`}
    >
      <div className="relative">
        <img
          src={room.images[0]}
          alt={`${room.hotel.name} - ${room.roomType || "Room"}`}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {isBestSeller && (
          <span className="px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full shadow-sm">
            Best Seller
          </span>
        )}
      </div>

      <div className="p-4 pt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-playfair text-xl font-medium text-gray-800 truncate">
            {room.hotel.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <img
              src={assets.starIconFilled}
              alt="Rating star"
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
          <img
            src={assets.locationIcon}
            alt="Location"
            className="w-4 h-4 flex-shrink-0"
          />
          <span className="truncate">{room.hotel.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-800">
            {formatPrice(room.pricePerNight)}
            <span className="text-sm font-normal text-gray-500">/night</span>
          </div>
          <button
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={(e) => {
              e.preventDefault();
              // Handle booking logic here
              console.log("Book now clicked for room:", room._id);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
