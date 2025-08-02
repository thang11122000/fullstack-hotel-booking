import cloudinary from "@/lib/cloudinary";
import Hotel from "@/models/Hotel";
import Room from "@/models/Room";

export const createRoom = async (req, res) => {
  try {
    const { roomType, pricePerNight, amenities } = req.body;
    const hotel = await Hotel.findOne({ owner: req.auth.userId });
    if (!hotel) {
      return res.json({
        success: false,
        message: "No hotel found",
      });
    }

    const uploadImages = req.files.map(async (file) => {
      const response = await cloudinary.uploader.upload(file.path);
      return response.secure_url;
    });

    const images = await Promise.all(uploadImages);

    await Room.create({
      hotel: hotel._id,
      roomType,
      pricePerNight,
      amenities: JSON.parse(amenities),
      images,
    });

    return res.status(201).json({ success: true, message: "Create Room" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ isAvailable: true })
      .populate({
        path: "hotel",
        populate: {
          path: "owner",
          select: "image",
        },
      })
      .sort({ createdAt: -1 });
    return res.status(201).json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getOwnerRooms = async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ owner: req.auth.userId });
    const rooms = await Room.find({
      hotel: hotelData?._id.toString(),
    }).populate("hotel");
    return res.status(201).json({ success: true, rooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const toggleRoomAvailability = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomData = await Room.findById(roomId);
    roomData.isAvailable = !roomData.isAvailable;
    await roomData.save();
    return res
      .status(201)
      .json({ success: true, message: "Toggle Availability Success" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
