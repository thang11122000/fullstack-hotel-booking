import { useEffect, useState, useCallback, memo } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets";
import { useAppContext } from "../../context/AppContext";
import type { Booking, LoadingState } from "../../types";

// Types
interface BookingCardProps {
  booking: Booking;
  onPayNow: (bookingId: string) => void;
}

interface BookingStats {
  total: number;
  paid: number;
  unpaid: number;
  upcoming: number;
  past: number;
}

// Utility functions
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const getBookingStatus = (
  booking: Booking
): "upcoming" | "current" | "past" => {
  const now = new Date();
  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);

  if (now < checkIn) return "upcoming";
  if (now >= checkIn && now <= checkOut) return "current";
  return "past";
};

const calculateBookingStats = (bookings: Booking[]): BookingStats => {
  return bookings.reduce(
    (stats, booking) => {
      const status = getBookingStatus(booking);
      return {
        total: stats.total + 1,
        paid: stats.paid + (booking.isPaid ? 1 : 0),
        unpaid: stats.unpaid + (booking.isPaid ? 0 : 1),
        upcoming: stats.upcoming + (status === "upcoming" ? 1 : 0),
        past: stats.past + (status === "past" ? 1 : 0),
      };
    },
    { total: 0, paid: 0, unpaid: 0, upcoming: 0, past: 0 }
  );
};

// Memoized Components
const BookingCard = memo(({ booking, onPayNow }: BookingCardProps) => {
  const { currency } = useAppContext();
  const bookingStatus = getBookingStatus(booking);

  const handlePayNow = useCallback(() => {
    onPayNow(booking._id);
  }, [booking._id, onPayNow]);

  const getStatusBadge = () => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (bookingStatus) {
      case "upcoming":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "current":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "past":
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <article className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-gray-300 hover:bg-gray-50/50 transition-colors">
      {/* Hotel Information */}
      <div className="flex flex-col md:flex-row">
        <div className="relative">
          <img
            src={booking.room?.images?.[0] || "/placeholder-room.jpg"}
            alt={`${booking.hotel?.name || "Hotel"} room`}
            className="w-full md:w-44 h-32 md:h-28 rounded-lg shadow-sm object-cover"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-room.jpg";
            }}
          />
          <div className="absolute top-2 left-2">
            <span className={getStatusBadge()}>
              {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-3 md:mt-0 md:ml-4 flex-1">
          <h3 className="font-playfair text-xl md:text-2xl text-gray-900">
            {booking.hotel?.name || "Hotel Name Unavailable"}
            {booking.room?.roomType && (
              <span className="font-inter text-sm text-gray-600 ml-2">
                ({booking.room.roomType})
              </span>
            )}
          </h3>

          {booking.hotel?.address && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <img
                src={assets.locationIcon}
                alt=""
                className="w-4 h-4"
                aria-hidden="true"
              />
              <span>{booking.hotel.address}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-sm text-gray-500">
            <img
              src={assets.guestsIcon}
              alt=""
              className="w-4 h-4"
              aria-hidden="true"
            />
            <span>
              {booking.guests} Guest{booking.guests !== 1 ? "s" : ""}
            </span>
          </div>

          <p className="text-base font-medium text-gray-900">
            Total: {currency}
            {booking.totalPrice.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Date Information */}
      <div className="flex flex-row md:gap-8 mt-4 md:mt-0 gap-6">
        <div>
          <p className="font-medium text-gray-700">Check-In:</p>
          <p className="text-gray-500 text-sm">
            {formatDate(booking.checkInDate)}
          </p>
        </div>
        <div>
          <p className="font-medium text-gray-700">Check-Out:</p>
          <p className="text-gray-500 text-sm">
            {formatDate(booking.checkOutDate)}
          </p>
        </div>
      </div>

      {/* Payment Status */}
      <div className="flex flex-col items-start justify-between pt-3 md:pt-0">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                booking.isPaid ? "bg-green-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-sm font-medium ${
                booking.isPaid ? "text-green-600" : "text-red-600"
              }`}
            >
              {booking.isPaid ? "Paid" : "Unpaid"}
            </span>
          </div>

          {!booking.isPaid && bookingStatus !== "past" && (
            <button
              onClick={handlePayNow}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              aria-label={`Pay now for booking at ${booking.hotel?.name}`}
            >
              Pay Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
});

BookingCard.displayName = "BookingCard";

const MyBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const { axios, getToken, currency } = useAppContext();

  // Fetch user bookings
  const fetchUserBookings = useCallback(async () => {
    setLoadingState("loading");
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const { data } = await axios.get("/api/bookings/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setBookings(data.data || []);
        setLoadingState("success");
      } else {
        throw new Error(data.message || "Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load bookings"
      );
      setLoadingState("error");
      setBookings([]);
    }
  }, [axios, getToken]);

  // Handle payment
  const handlePayNow = useCallback(async (bookingId: string) => {
    try {
      // Here you would typically integrate with a payment service
      // For now, we'll just show an alert
      alert(
        `Payment functionality for booking ${bookingId} would be implemented here`
      );

      // After successful payment, you might want to refresh the bookings
      // await fetchUserBookings();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    }
  }, []);

  // Retry function for error state
  const handleRetry = useCallback(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  // Calculate statistics
  const stats = calculateBookingStats(bookings);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  // Error component
  const ErrorMessage = () => (
    <div className="text-center py-20">
      <div className="text-red-500 text-lg mb-4">
        {error || "Something went wrong"}
      </div>
      <button
        onClick={handleRetry}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="text-gray-500 text-lg mb-4">No bookings found</div>
      <p className="text-gray-400 mb-6">
        You haven't made any hotel reservations yet.
      </p>
      <button
        onClick={() => (window.location.href = "/rooms")}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Browse Hotels
      </button>
    </div>
  );

  return (
    <div className="py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Bookings"
        subTitle="Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks"
        align="center"
        font="font-playfair"
      />

      {/* Statistics Cards */}
      {loadingState === "success" && bookings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.upcoming}
            </div>
            <div className="text-sm text-gray-500">Upcoming</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.paid}
            </div>
            <div className="text-sm text-gray-500">Paid</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.unpaid}
            </div>
            <div className="text-sm text-gray-500">Unpaid</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {/* Table Header */}
        {loadingState === "success" && bookings.length > 0 && (
          <header className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3 mb-4">
            <div>Hotel Details</div>
            <div>Date & Timings</div>
            <div>Payment Status</div>
          </header>
        )}

        {/* Content based on loading state */}
        {loadingState === "loading" && <LoadingSpinner />}
        {loadingState === "error" && <ErrorMessage />}
        {loadingState === "success" && bookings.length === 0 && <EmptyState />}
        {loadingState === "success" && bookings.length > 0 && (
          <div className="space-y-0">
            {bookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onPayNow={handlePayNow}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooking;
