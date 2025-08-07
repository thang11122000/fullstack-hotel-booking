import HotelCard from "../../components/HotelCard";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";

const FeaturedDestination = () => {
  const { navigate, rooms } = useAppContext();
  return (
    rooms.length > 0 && (
      <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20">
        <Title
          title={"Featured Destination"}
          subTitle={
            "Discover our handpicked selection of exceptional properties around the word, offering unparalleled luxury and unforgettable experiences."
          }
          align="center"
          font="font-playfair"
        />
        <div className="w-full flex flex-wrap items-center justify-center gap-6 mt-20">
          {rooms.slice(0, 4).map((room, index) => (
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

export default FeaturedDestination;
