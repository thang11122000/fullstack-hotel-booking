import React, { useEffect, useState, useCallback, useMemo } from "react";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

// Type definitions
interface Room {
  _id: string;
  roomType: string;
  amenities: string[];
  pricePerNight: number;
  isAvailable: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const ListRoom: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toggleLoading, setToggleLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { axios, getToken, user } = useAppContext();

  const fetchRooms = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available");
      }

      const { data } = await axios.get<ApiResponse<Room[]>>(
        "/api/rooms/owner",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setRooms(data.data || []);
      } else {
        const errorMessage = data.message || "Failed to fetch rooms";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch rooms";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [axios, getToken, user]);

  const toggleAvailability = useCallback(
    async (roomId: string) => {
      setToggleLoading(roomId);

      try {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication token not available");
        }

        const { data } = await axios.post<ApiResponse<any>>(
          `/api/rooms/toggle-availability`,
          { roomId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          toast.success("Room availability updated successfully");
          // Optimistically update the room state instead of refetching all rooms
          setRooms((prevRooms) =>
            prevRooms.map((room) =>
              room._id === roomId
                ? { ...room, isAvailable: !room.isAvailable }
                : room
            )
          );
        } else {
          const errorMessage =
            data.message || "Failed to update room availability";
          toast.error(errorMessage);
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update room availability";
        toast.error(errorMessage);
      } finally {
        setToggleLoading(null);
      }
    },
    [axios, getToken]
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Memoized computed values
  const roomStats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((room) => room.isAvailable).length;
    const unavailable = total - available;
    return { total, available, unavailable };
  }, [rooms]);

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-2 text-gray-600">Loading rooms...</span>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">🏨</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
      <p className="text-gray-500 mb-4">You haven't added any rooms yet.</p>
      <button
        onClick={fetchRooms}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Refresh
      </button>
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="text-red-400 text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Error loading rooms
      </h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={fetchRooms}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title align={"left"} title={"Room Management"} font={"outfit"} />
          <p className="text-gray-500 mt-2">
            Manage your hotel rooms and availability
          </p>
        </div>
        <button
          onClick={fetchRooms}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Room Statistics */}
      {!loading && !error && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {roomStats.total}
            </div>
            <div className="text-sm text-blue-800">Total Rooms</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {roomStats.available}
            </div>
            <div className="text-sm text-green-800">Available</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {roomStats.unavailable}
            </div>
            <div className="text-sm text-red-800">Unavailable</div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState />
        ) : rooms.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-sm:hidden">
                      Amenities
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price/Night
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr
                      key={room._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {room.roomType}
                        </div>
                      </td>
                      <td className="py-4 px-4 max-sm:hidden">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {room.amenities?.length > 0
                            ? room.amenities.join(", ")
                            : "No amenities"}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ${room.pricePerNight}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            room.isAvailable
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {room.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={room.isAvailable}
                            disabled={toggleLoading === room._id}
                            onChange={() => toggleAvailability(room._id)}
                            aria-label={`Toggle availability for ${room.roomType}`}
                          />
                          <div
                            className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                              toggleLoading === room._id
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                          >
                            {toggleLoading === room._id && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListRoom;
