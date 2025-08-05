import React, { useState, useCallback, useMemo } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const MAX_RECENT_SEARCHES = 3;
const MIN_GUESTS = 1;
const MAX_GUESTS = 4;

const Hero: React.FC = () => {
  const { navigate, getToken, axios, setSearchedCities } = useAppContext();

  const [destination, setDestination] = useState<string>("");
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState<number>(1);

  const cityOptions = useMemo(
    () =>
      cities.map((city) => (
        <option value={city} key={city}>
          {city}
        </option>
      )),
    []
  );

  const handleDestinationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setDestination(e.target.value);
    },
    []
  );

  const handleCheckInChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCheckIn(e.target.value);
    },
    []
  );

  const handleCheckOutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCheckOut(e.target.value);
    },
    []
  );

  const handleGuestsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= MIN_GUESTS && value <= MAX_GUESTS) {
        setGuests(value);
      }
    },
    []
  );

  const updateRecentSearches = useCallback(
    (searchDestination: string) => {
      setSearchedCities((prev: string[]) => {
        const updatedSearches = [...prev, searchDestination];
        if (updatedSearches.length > MAX_RECENT_SEARCHES) {
          updatedSearches.shift();
        }
        return updatedSearches;
      });
    },
    [setSearchedCities]
  );

  const storeRecentSearch = useCallback(
    async (searchDestination: string) => {
      try {
        const token = await getToken();
        await axios.post(
          "/api/user/store-recent-search",
          { recentSearchCity: searchDestination },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Failed to store recent search:", error);
      }
    },
    [axios, getToken]
  );

  const handleSearch = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!destination.trim()) {
        return;
      }

      // Build search query parameters
      const searchParams = new URLSearchParams({
        destination: destination.trim(),
        ...(checkIn && { checkIn }),
        ...(checkOut && { checkOut }),
        ...(guests && { guests: guests.toString() }),
      });

      // Navigate to search results
      navigate(`/room?${searchParams.toString()}`);

      // Store recent search and update local state
      await Promise.all([
        storeRecentSearch(destination.trim()),
        updateRecentSearches(destination.trim()),
      ]);
    },
    [
      destination,
      checkIn,
      checkOut,
      guests,
      navigate,
      storeRecentSearch,
      updateRecentSearches,
    ]
  );

  return (
    <div className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url('/src/assets/heroImage.png')] bg-cover bg-center h-screen bg-no-repeat">
      {/* Hero Content */}
      <div className="mt-20">
        <p className="bg-[#49b9ff]/50 px-3.5 py-1 rounded-full w-max">
          The Ultimate Hotel Experience
        </p>
        <h1 className="font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4">
          Discover Your Perfect Gateway Destination
        </h1>
        <p className="max-w-130 mt-2 text-sm md:text-base">
          Unparalleled luxury and comfort await at the world's most exclusive
          hotels and resorts. Start your journey today.
        </p>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white mt-8 text-gray-500 rounded-lg px-6 py-4 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto"
        noValidate
      >
        {/* Destination Field */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={assets.calenderIcon}
              alt="Location icon"
              className="h-4"
            />
            <label htmlFor="destinationInput" className="text-sm font-medium">
              Destination
            </label>
          </div>
          <input
            onChange={handleDestinationChange}
            value={destination}
            list="destinations"
            id="destinationInput"
            type="text"
            className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Type here..."
            required
            aria-describedby="destination-error"
          />
          <datalist id="destinations">{cityOptions}</datalist>
        </div>

        {/* Check-in Field */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={assets.calenderIcon}
              alt="Calendar icon"
              className="h-4"
            />
            <label htmlFor="checkIn" className="text-sm font-medium">
              Check in
            </label>
          </div>
          <input
            onChange={handleCheckInChange}
            value={checkIn}
            id="checkIn"
            type="date"
            className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Check-out Field */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <img
              src={assets.calenderIcon}
              alt="Calendar icon"
              className="h-4"
            />
            <label htmlFor="checkOut" className="text-sm font-medium">
              Check out
            </label>
          </div>
          <input
            onChange={handleCheckOutChange}
            value={checkOut}
            id="checkOut"
            type="date"
            className="w-full rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            min={checkIn || new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Guests Field */}
        <div className="flex md:flex-col max-md:gap-2 max-md:items-center">
          <label htmlFor="guests" className="text-sm font-medium mb-1.5">
            Guests
          </label>
          <input
            onChange={handleGuestsChange}
            value={guests}
            min={MIN_GUESTS}
            max={MAX_GUESTS}
            id="guests"
            type="number"
            className="rounded border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-w-16"
            placeholder="1"
          />
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="cursor-pointer flex items-center justify-center gap-1 rounded-md bg-black py-1.5 px-3 text-white my-auto transition-colors duration-200 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 max-md:w-full max-md:py-2"
            disabled={!destination.trim()}
          >
            <img src={assets.searchIcon} alt="Search icon" className="w-5" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Hero;
