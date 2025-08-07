import { useCallback, useMemo, useState, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { assets, facilityIcons } from "../../assets/assets";
import StarRating from "../../components/StarRating";
import { useAppContext } from "../../context/AppContext";
import type { Room } from "../../types";

// Types
interface CheckboxProps {
  label: string;
  selected?: boolean;
  onChange?: (checked: boolean, label: string) => void;
}

interface RadioButtonProps {
  label: string;
  selected?: boolean;
  onChange?: (label: string) => void;
}

interface SelectedFilters {
  roomType: string[];
  priceRange: string[];
}

type SortOption = "Price Low to High" | "Price High to Low" | "Newest First";
type FilterType = keyof SelectedFilters;

// Constants
const ROOM_TYPES = [
  "Single Bed",
  "Double Bed",
  "Luxury Room",
  "Family Suite",
] as const;
const PRICE_RANGES = [
  "0 to 500",
  "500 to 1000",
  "1000 to 2000",
  "2000 to 3000",
] as const;
const SORT_OPTIONS: SortOption[] = [
  "Price Low to High",
  "Price High to Low",
  "Newest First",
];

// Memoized Components
const Checkbox = memo(
  ({ label, selected = false, onChange = () => {} }: CheckboxProps) => (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
);

Checkbox.displayName = "Checkbox";

const RadioButton = memo(
  ({ label, selected = false, onChange = () => {} }: RadioButtonProps) => (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => onChange(label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
);

RadioButton.displayName = "RadioButton";

// Room Card Component
const RoomCard = memo(({ room }: { room: Room }) => {
  const { navigate, currency } = useAppContext();

  const handleRoomClick = useCallback(() => {
    navigate(`/rooms/${room._id}`);
    window.scrollTo(0, 0);
  }, [navigate, room._id]);

  return (
    <div className="flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0">
      <img
        title="View Room Details"
        alt={`${room.hotel.name} room`}
        className="max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer"
        src={room.images[0]}
        onClick={handleRoomClick}
        loading="lazy"
      />
      <div className="md:w-1/2 flex flex-col gap-2">
        <p className="text-gray-500">{room.hotel.city}</p>
        <p
          className="text-gray-800 text-3xl font-playfair cursor-pointer"
          title="View Room Details"
          onClick={handleRoomClick}
        >
          {room.hotel.name}
        </p>
        <div className="flex items-center">
          <StarRating />
          <p className="ml-2">200+ reviews</p>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
          <img alt="location-icon" src={assets.locationIcon} />
          <span>{room.hotel.address}</span>
        </div>
        <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
          {room.amenities.map((amenity) => (
            <div
              key={amenity}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
            >
              <img
                alt={amenity}
                className="w-5 h-5"
                src={facilityIcons[amenity as keyof typeof facilityIcons]}
              />
              <p className="text-xs">{amenity}</p>
            </div>
          ))}
        </div>
        <p className="text-xl font-medium text-gray-700">
          {currency}
          {room.pricePerNight} /night
        </p>
      </div>
    </div>
  );
});

RoomCard.displayName = "RoomCard";

const AllRooms = () => {
  const [searchParams] = useSearchParams();
  const { rooms, navigate, currency } = useAppContext();

  const [openFilters, setOpenFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    roomType: [],
    priceRange: [],
  });
  const [selectedSort, setSelectedSort] = useState<SortOption | "">("");

  // Memoized handlers
  const handleFilterChange = useCallback(
    (checked: boolean, value: string, type: FilterType) => {
      setSelectedFilters((prevState) => ({
        ...prevState,
        [type]: checked
          ? [...prevState[type], value]
          : prevState[type].filter((item) => item !== value),
      }));
    },
    []
  );

  const handleSortChange = useCallback((value: string) => {
    setSelectedSort(value as SortOption);
  }, []);

  const toggleFilters = useCallback(() => {
    setOpenFilters((prev) => !prev);
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({ roomType: [], priceRange: [] });
    setSelectedSort("");
  }, []);

  // Filtering functions
  const matchesRoomType = useCallback(
    (room: Room): boolean => {
      return (
        selectedFilters.roomType.length === 0 ||
        selectedFilters.roomType.includes(room.roomType)
      );
    },
    [selectedFilters.roomType]
  );

  const matchesPriceRange = useCallback(
    (room: Room): boolean => {
      if (selectedFilters.priceRange.length === 0) return true;

      return selectedFilters.priceRange.some((range: string) => {
        const [minStr, maxStr] = range.split(" to ");
        const min = Number(minStr);
        const max = Number(maxStr);
        return (
          !isNaN(min) &&
          !isNaN(max) &&
          room.pricePerNight >= min &&
          room.pricePerNight <= max
        );
      });
    },
    [selectedFilters.priceRange]
  );

  const matchesDestination = useCallback(
    (room: Room): boolean => {
      const destination = searchParams.get("destination");
      if (!destination) return true;
      return room.hotel.city.toLowerCase().includes(destination.toLowerCase());
    },
    [searchParams]
  );

  // Sorting function
  const sortRooms = useCallback(
    (a: Room, b: Room): number => {
      switch (selectedSort) {
        case "Price Low to High":
          return a.pricePerNight - b.pricePerNight;
        case "Price High to Low":
          return b.pricePerNight - a.pricePerNight;
        case "Newest First":
          if (!a.createdAt || !b.createdAt) return 0;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        default:
          return 0;
      }
    },
    [selectedSort]
  );

  // Main filtered and sorted rooms
  const filteredRooms = useMemo(() => {
    return rooms
      .filter(
        (room) =>
          matchesRoomType(room) &&
          matchesPriceRange(room) &&
          matchesDestination(room)
      )
      .sort(sortRooms);
  }, [
    rooms,
    matchesRoomType,
    matchesPriceRange,
    matchesDestination,
    sortRooms,
  ]);

  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Main Content */}
      <main className="flex-1">
        <header className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            Take advantage of our limited-time offers and special packages to
            enhance your stay and create unforgettable memories.
          </p>
        </header>

        {/* Results Count */}
        <div className="mt-6 mb-4">
          <p className="text-gray-600">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        {/* Room List */}
        <div className="space-y-0">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => <RoomCard key={room._id} room={room} />)
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">
                No rooms found matching your criteria.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Filters Sidebar */}
      <aside className="bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16">
        <div
          className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${
            openFilters && "border-b"
          }`}
        >
          <h2 className="text-base font-medium text-gray-800">FILTERS</h2>
          <div className="text-xs cursor-pointer">
            <button
              className="lg:hidden hover:text-gray-900 transition-colors"
              onClick={toggleFilters}
              aria-label={openFilters ? "Hide filters" : "Show filters"}
            >
              {openFilters ? "HIDE" : "OPEN"}
            </button>
            <button
              className="hidden lg:block hover:text-gray-900 transition-colors"
              onClick={clearAllFilters}
              aria-label="Clear all filters"
            >
              CLEAR
            </button>
          </div>
        </div>

        <div
          className={`${
            openFilters ? "h-auto" : "h-0 lg:h-auto"
          } overflow-hidden transition-all duration-300`}
        >
          {/* Room Type Filters */}
          <section className="px-5 pt-5">
            <h3 className="font-medium text-gray-800 pb-2">Room Type</h3>
            {ROOM_TYPES.map((type) => (
              <Checkbox
                key={type}
                label={type}
                selected={selectedFilters.roomType.includes(type)}
                onChange={(checked) =>
                  handleFilterChange(checked, type, "roomType")
                }
              />
            ))}
          </section>

          {/* Price Range Filters */}
          <section className="px-5 pt-5">
            <h3 className="font-medium text-gray-800 pb-2">Price Range</h3>
            {PRICE_RANGES.map((range) => (
              <Checkbox
                key={range}
                label={`${currency} ${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={(checked) =>
                  handleFilterChange(checked, range, "priceRange")
                }
              />
            ))}
          </section>

          {/* Sort Options */}
          <section className="px-5 pt-5 pb-7">
            <h3 className="font-medium text-gray-800 pb-2">Sort By</h3>
            {SORT_OPTIONS.map((option) => (
              <RadioButton
                key={option}
                label={option}
                selected={option === selectedSort}
                onChange={handleSortChange}
              />
            ))}
          </section>
        </div>
      </aside>
    </div>
  );
};

export default AllRooms;
