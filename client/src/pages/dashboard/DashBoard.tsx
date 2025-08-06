import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import type { DashboardData, Booking, LoadingState } from "../../types";

// Types
interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange";
}

interface BookingRowProps {
  booking: Booking;
  currency: string;
  onStatusUpdate?: (bookingId: string, newStatus: boolean) => void;
}

// Utility functions
const formatCurrency = (amount: number, currency: string): string => {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const calculateDashboardStats = (bookings: Booking[]) => {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthBookings = bookings.filter(
    (b) => new Date(b.createdAt) >= thisMonth
  );
  const lastMonthBookings = bookings.filter(
    (b) =>
      new Date(b.createdAt) >= lastMonth && new Date(b.createdAt) < thisMonth
  );

  const paidBookings = bookings.filter((b) => b.isPaid);
  const pendingBookings = bookings.filter((b) => !b.isPaid);

  const thisMonthRevenue = thisMonthBookings.reduce(
    (sum, b) => sum + (b.isPaid ? b.totalPrice : 0),
    0
  );
  const lastMonthRevenue = lastMonthBookings.reduce(
    (sum, b) => sum + (b.isPaid ? b.totalPrice : 0),
    0
  );

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

  const bookingGrowth =
    lastMonthBookings.length > 0
      ? ((thisMonthBookings.length - lastMonthBookings.length) /
          lastMonthBookings.length) *
        100
      : 0;

  return {
    totalRevenue: bookings.reduce(
      (sum, b) => sum + (b.isPaid ? b.totalPrice : 0),
      0
    ),
    totalBookings: bookings.length,
    paidBookings: paidBookings.length,
    pendingBookings: pendingBookings.length,
    thisMonthRevenue,
    revenueGrowth,
    bookingGrowth,
    recentBookings: bookings.slice(0, 10),
  };
};

// Memoized Components
const StatCard = memo(
  ({ icon, title, value, subtitle, trend, color = "blue" }: StatCardProps) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-600",
      green: "bg-green-50 border-green-200 text-green-600",
      purple: "bg-purple-50 border-purple-200 text-purple-600",
      orange: "bg-orange-50 border-orange-200 text-orange-600",
    };

    return (
      <div
        className={`${colorClasses[color]} border rounded-lg p-6 transition-all hover:shadow-md`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={icon} alt="" className="h-10 w-10 mr-4" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">{title}</h3>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
            >
              <span className={`mr-1 ${trend.isPositive ? "↗" : "↘"}`}>
                {trend.isPositive ? "↗" : "↘"}
              </span>
              {Math.abs(trend.value).toFixed(1)}%
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

const BookingRow = memo(
  ({ booking, currency, onStatusUpdate }: BookingRowProps) => {
    const handleStatusToggle = useCallback(() => {
      if (onStatusUpdate) {
        onStatusUpdate(booking._id, !booking.isPaid);
      }
    }, [booking._id, booking.isPaid, onStatusUpdate]);

    return (
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="py-4 px-6 text-gray-900 font-medium">
          {booking.user?.username || "Unknown User"}
        </td>
        <td className="py-4 px-6 text-gray-700 max-sm:hidden">
          {booking.room?.roomType || "N/A"}
        </td>
        <td className="py-4 px-6 text-gray-700">
          {booking.hotel?.name || "N/A"}
        </td>
        <td className="py-4 px-6 text-gray-700 text-center">
          {formatDate(booking.createdAt)}
        </td>
        <td className="py-4 px-6 text-gray-900 font-semibold text-center">
          {formatCurrency(booking.totalPrice, currency)}
        </td>
        <td className="py-4 px-6 text-center">
          <button
            onClick={handleStatusToggle}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              booking.isPaid
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-2 ${
                booking.isPaid ? "bg-green-500" : "bg-yellow-500"
              }`}
            />
            {booking.isPaid ? "Paid" : "Pending"}
          </button>
        </td>
      </tr>
    );
  }
);

BookingRow.displayName = "BookingRow";

const DashBoard = () => {
  const { currency, user, getToken, axios } = useAppContext();

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    bookings: [],
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoadingState("loading");
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const { data } = await axios.get("/api/bookings/hotel", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setDashboardData(data.data);
        setLoadingState("success");
      } else {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load dashboard data";
      setError(errorMessage);
      setLoadingState("error");
      toast.error(errorMessage);
    }
  }, [axios, getToken]);

  // Handle booking status update
  const handleStatusUpdate = useCallback(
    async (bookingId: string, newStatus: boolean) => {
      try {
        const token = await getToken();
        const { data } = await axios.patch(
          `/api/bookings/${bookingId}/status`,
          { isPaid: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          // Update local state
          setDashboardData((prev) => ({
            ...prev,
            bookings: prev.bookings.map((booking) =>
              booking._id === bookingId
                ? { ...booking, isPaid: newStatus }
                : booking
            ),
          }));
          toast.success(
            `Payment status updated to ${newStatus ? "Paid" : "Pending"}`
          );
        } else {
          throw new Error(data.message || "Failed to update status");
        }
      } catch (error) {
        console.error("Error updating booking status:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to update status"
        );
      }
    },
    [axios, getToken]
  );

  // Retry function for error state
  const handleRetry = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, user]);

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    return calculateDashboardStats(dashboardData.bookings);
  }, [dashboardData.bookings]);

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
        Your hotel hasn't received any bookings yet.
      </p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Title
        align="left"
        font="outfit"
        title="Dashboard"
        subTitle="Monitor your hotel's performance and manage bookings"
      />

      {loadingState === "loading" && <LoadingSpinner />}
      {loadingState === "error" && <ErrorMessage />}

      {loadingState === "success" && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={assets.totalBookingIcon}
              title="Total Bookings"
              value={stats.totalBookings}
              subtitle="All time bookings"
              trend={{
                value: stats.bookingGrowth,
                isPositive: stats.bookingGrowth >= 0,
              }}
              color="blue"
            />

            <StatCard
              icon={assets.totalRevenueIcon}
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue, currency)}
              subtitle="Paid bookings only"
              trend={{
                value: stats.revenueGrowth,
                isPositive: stats.revenueGrowth >= 0,
              }}
              color="green"
            />

            <StatCard
              icon={assets.totalBookingIcon}
              title="Paid Bookings"
              value={stats.paidBookings}
              subtitle={`${stats.totalBookings > 0 ? Math.round((stats.paidBookings / stats.totalBookings) * 100) : 0}% completion rate`}
              color="purple"
            />

            <StatCard
              icon={assets.totalRevenueIcon}
              title="Pending Payments"
              value={stats.pendingBookings}
              subtitle="Awaiting payment"
              color="orange"
            />
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Bookings
                </h2>
                <button
                  onClick={fetchDashboardData}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>

            {stats.recentBookings.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-sm:hidden">
                        Room Type
                      </th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentBookings.map((booking) => (
                      <BookingRow
                        key={booking._id}
                        booking={booking}
                        currency={currency}
                        onStatusUpdate={handleStatusUpdate}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashBoard;
