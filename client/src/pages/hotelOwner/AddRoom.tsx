import React, { useState } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import type { RoomFormData } from "../../types";

const AddRoom = () => {
  const [images, setImages] = useState<{ [key: string]: File | null }>({
    "1": null,
    "2": null,
    "3": null,
    "4": null,
  });

  const [inputs, setInputs] = useState({
    roomType: "",
    pricePerNight: "",
    amenities: {
      "Free Wifi": false,
      "Free Breakfast": false,
      "Room Service": false,
      "Mountain View": false,
      "Pool Access": false,
    },
  });

  return (
    <form>
      <Title align={"left"} font={"outfit"} title={"Add Room"}></Title>
      <p className="text-gray-800 mt-10">Images</p>
      <div>
        {Object.keys(images).map((key) => (
          <label htmlFor={`roomImage${key}`} key={key}>
            <img
              src={
                images[key]
                  ? URL.createObjectURL(images[key])
                  : assets.uploadArea
              }
              className="grid grid-cols-2 sm:flex gap-4 my-2 flex-wrap"
            />
            <input
              type="file"
              id={`roomImage${key}`}
              accept="image/*"
              hidden
              onChange={(e) =>
                setImages({ ...images, [key]: e.target.files?.[0] || null })
              }
            />
          </label>
        ))}
      </div>

      <div className="w-full flex max-sm:flex-col sm:gap-4 mt-4">
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Room Type</p>
          <select
            className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full"
            onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        <div>
          <p className="mt-4 text-gray-800">
            Price <span className="text-xs">/night</span>
          </p>
          <input
            type="number"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-2 w-24"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
          />
        </div>
      </div>

      <p className="text-gray-800 mt-4">Amenities</p>
      <div className="flex flex-col flex-wrap mt-1 text-gray-400 max-w-sm">
        {Object.entries(inputs.amenities).map(
          ([amenityKey, amenityValue], index) => (
            <div key={index}>
              <input
                type="checkbox"
                id={`amenities${index + 1}`}
                checked={amenityValue}
                onChange={() =>
                  setInputs({
                    ...inputs,
                    amenities: {
                      ...inputs.amenities,
                      [amenityKey]: !amenityValue,
                    },
                  })
                }
              />
              <label htmlFor={`amenities${index + 1}`}>{amenityKey}</label>
            </div>
          )
        )}
      </div>

      <button className="bg-primary text-white px-8 py-4 rounded mt-8 cursor-pointer">
        Add Room
      </button>
    </form>
  );
};

export default AddRoom;
