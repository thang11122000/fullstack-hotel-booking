import Booking from "@/models/Booking";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";

const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });

    const isAvailable = bookings.length > 0;
    return isAvailable;
  } catch (error) {
    console.error(error);
  }
};

export const checkAvailabilityAPI = async ({ req, res }) => {
  try {
    const { checkInDate, checkOutDate, room } = req.body;
    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });
    return res.json({ success: true, isAvailable });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// API to create a new booking
export const createBookingAPI = async ({ req, res }) => {
  try {
    const { room, checkInDate, checkOutDate, guests } = req.body;
    const user = req.user._id;

    const isAvailable = await checkAvailability({
      checkInDate,
      checkOutDate,
      room,
    });

    if (!isAvailable) {
      return res
        .status(409)
        .json({ success: false, message: "Room not available" });
    }

    const roomData = await Room.findById(room).populate("hotel");
    let totalPrice = roomData?.pricePerNight;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const night = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    totalPrice *= night;

    const booking = await Booking.create({
      room,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      user,
      hotel: roomData.hotel._id,
    });

    return res.json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getUserBookings = async ({ req, res }) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user: user })
      .populate(["room", "user"])
      .sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getHotelBookings = async ({ req, res }) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.userId });

    if (!hotel) {
      return res
        .status(404)
        .json({ success: false, message: "Hotel not found" });
    }

    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce(
      (acc, curr) => acc + curr.totalPrice,
      0
    );

    return res.json({
      success: true,
      data: {
        bookings,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
