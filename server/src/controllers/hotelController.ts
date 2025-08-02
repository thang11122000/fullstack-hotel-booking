import Hotel from "@/models/Hotel";
import User from "@/models/User";

export const registerHotel = async (req, res) => {
  try {
    const { name, address, contact, city } = req.body;
    const owner = req.user._id;

    const hotel = await Hotel.findOne({ owner });

    if (hotel) {
      return res.json({
        status: false,
        message: "You Already Registered",
      });
    }

    await Hotel.create({ name, address, contact, city, owner });

    await User.findByIdAndUpdate(owner, { role: "hotelOwner" });

    return res.status(201).json({ success: false, message: "hotel created" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
