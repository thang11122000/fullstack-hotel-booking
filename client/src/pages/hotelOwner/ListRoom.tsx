import React, { useEffect, useState } from "react";
import { roomsDummyData } from "../../assets/assets";
import Title from "../../components/Title";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { axios, getToken, user } = useAppContext();

  const fetchRooms = async () => {
    try {
      const token = await getToken();
      if (token) {
        const { data } = await axios.get("/api/rooms/owner", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setRooms(data.data);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post(
        `/api/rooms/toggle-availability`,
        {
          roomId,
        },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );
      if (data.success) {
        toast.success("Successfully updated room availability");
        fetchRooms();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  return (
    <div>
      <Title align={"left"} title={"List Room"} font={"outfit"} />
      <p className="text-gray-500 mt-8">All Rooms</p>

      <div className="mt-3 w-full max-w-3xl text-left border border-gray-300 rounded-lg max-h-80 overflow-y-scroll">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium max-sm:hidden">
                Facility
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium">
                Price / night
              </th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {rooms.map((item) => (
              <tr key={item._id}>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  {item.roomType}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300 max-sm:hidden">
                  {item.amenities.join(", ")}
                </td>
                <td className="py-3 px-4 text-gray-700 border-t border-gray-300">
                  $ {item.pricePerNight}
                </td>
                <td className="py-3 px-4 border-t border-gray-300 text-sm text-red-500 text-center">
                  <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.isAvailable}
                      onChange={() => {
                        toggleAvailability(item._id);
                      }}
                    />
                    <div className="w-12 h-7 bg-slate-300 peer-checked:bg-blue-600 rounded-full transition duration-200 ease-in-out"></div>
                    <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListRoom;
