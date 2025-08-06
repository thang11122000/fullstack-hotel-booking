import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  assets,
  facilityIcons,
  roomCommonData,
  roomsDummyData,
} from "../../assets/assets";
import StarRating from "../../components/StarRating";
import type { Room } from "../../types";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const RoomDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { rooms, getToken, axios, navigate } = useAppContext();

  const [room, setRoom] = useState<Room | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState(false);

  const checkAvailability = async () => {
    try {
      if (!checkInDate || !checkOutDate) {
        toast.error("Please select both dates");
        return;
      }

      if (checkInDate >= checkOutDate) {
        toast.error("Invalid date range");
        return;
      }

      const { data } = await axios.post("/api/bookings/check-availability", {
        room: id,
        checkInDate,
        checkOutDate,
      });

      if (data.success) {
        if (data.data.isAvailable) {
          setIsAvailable(true);
          toast.success(
            `This room is available between ${checkInDate} and ${checkOutDate}`
          );
        } else {
          setIsAvailable(false);
          toast.error(`Sorry! This room is not available`);
        }
      } else {
        toast.error(
          `Sorry! This room is not available between ${checkInDate} and ${checkOutDate}`
        );
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
      if (!isAvailable) {
        return checkAvailability();
      } else {
        const { data } = await axios.post(
          "/api/bookings/book",
          {
            room: id,
            checkInDate,
            checkOutDate,
            guests,
          },
          {
            headers: {
              authorization: `Bearer ${await getToken()}`,
            },
          }
        );

        if (data.success) {
          toast.success(data.message);
          navigate("/my-bookings");
          scrollTo(0, 0);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const room = rooms.find((r) => r._id === id);
    if (room) {
      setRoom(room as Room);
      if (room.images && room.images.length > 0) {
        setMainImage(room.images[0] || null);
      }
    }
  }, [id, rooms]);

  return (
    room && (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <h1 className="text-3xl md:text-4xl font-playfair">
            {room.hotel.name}{" "}
            <span className="font-inter text-sm">({room.roomType})</span>
          </h1>
          <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
            20% OFF
          </p>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <StarRating />
          <p className="ml-2">200+ reviews</p>
        </div>
        <div className="flex items-center gap-1 text-gray-500 mt-2">
          <img alt="location-icon" src={assets.locationIcon} />
          <span>{room.hotel.address}</span>
        </div>
        <div className="flex flex-col lg:flex-row mt-6 gap-6">
          <div className="lg:w-1/2 w-full">
            <img
              className="w-full rounded-xl shadow-lg object-cover"
              alt="Room Image"
              src={mainImage || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
            {room?.images.length > 1 &&
              room.images.map((image, index) => {
                return (
                  <img
                    key={index}
                    onClick={() => setMainImage(image)}
                    className="w-full rounded-xl shadow-md object-cover cursor-pointer outline-3 outline-orange-500"
                    alt="Room Image"
                    src={image}
                  />
                );
              })}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between mt-10">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-playfair">
              Experience Luxury Like Never Before
            </h1>
            <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
              {room.amenities.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
                  >
                    <img
                      alt="Room Service"
                      className="w-5 h-5"
                      src={(facilityIcons as any)[item] || ""}
                    />
                    <p className="text-xs">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-2xl font-medium">${room.pricePerNight}/night</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl"
        >
          <div className="flex flex-col flex-wrap md:flex-row items-start md:items-center gap-4 md:gap-10 text-gray-500">
            <div className="flex flex-col">
              <label htmlFor="checkInDate" className="font-medium">
                Check-In
              </label>
              <input
                id="checkInDate"
                min="2025-07-31"
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                placeholder="Check-In"
                required
                type="date"
                onChange={(e) => setCheckInDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="w-px h-15 bg-gray-300/70 max-md:hidden" />
            <div className="flex flex-col">
              <label htmlFor="checkOutDate" className="font-medium">
                Check-Out
              </label>
              <input
                id="checkOutDate"
                className="w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                placeholder="Check-Out"
                required
                type="date"
                min={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                // disabled={!checkOutDate}
              />
            </div>
            <div className="w-px h-15 bg-gray-300/70 max-md:hidden" />
            <div className="flex flex-col">
              <label htmlFor="guests" className="font-medium">
                Guests
              </label>
              <input
                id="guests"
                className="max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none"
                placeholder="1"
                required
                type="number"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer"
          >
            {isAvailable ? "Book Now" : "Check Available"}
          </button>
        </form>
        <div className="mt-25 space-y-4">
          {roomCommonData.map((spec) => {
            return (
              <div key={spec.title} className="flex items-start gap-2">
                <img
                  className="w-6.5"
                  alt="Clean & Safe Stay-icon"
                  src={spec.icon}
                />
                <div>
                  <p className="text-base">{spec.title}</p>
                  <p className="text-gray-500">{spec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
          <p>
            Guests will be allocated on the ground floor according to
            availability. You get a comfortable Two bedroom apartment has a true
            city feeling. The price quoted is for two guest, at the guest slot
            please mark the number of guests to get the exact price for groups.
            The Guests will be allocated ground floor according to availability.
            You get the comfortable two bedroom apartment that has a true city
            feeling.
          </p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <div className="flex gap-4">
            <img
              className="h-14 w-14 md:h-18 md:w-18 rounded-full"
              alt="Host"
              src={room.hotel.owner?.image || ""}
            />
            <div>
              <p className="text-lg md:text-xl">Hosted by {room.hotel.name}</p>
              <div className="flex items-center mt-1">
                <StarRating />
                <p className="ml-2">200+ reviews</p>
              </div>
            </div>
          </div>
          <button className="px-6 py-2.5 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all cursor-pointer">
            Contact Now
          </button>
        </div>
      </div>
    )
  );
};

export default RoomDetails;
