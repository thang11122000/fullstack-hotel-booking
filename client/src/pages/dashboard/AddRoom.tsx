import React, { useState, useCallback, useMemo } from "react";
import Title from "../../components/Title";
import { assets } from "../../assets/assets";
import type { RoomFormData, ApiResponse, Room } from "../../types";
import { useAppContext } from "../../context/AppContext";
import { useForm } from "../../hooks/useForm";
import { validateForm, ROOM_VALIDATION_RULES } from "../../utils/validation";
import type { ValidationRules } from "../../utils/validation";
import { DEFAULT_AMENITIES, ROOM_TYPES } from "../../constants/amenities";
import toast from "react-hot-toast";

// Constants
const MAX_IMAGES = 4;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Types
interface FormValues {
  roomType: string;
  pricePerNight: string;
  amenities: Record<string, boolean>;
}

interface FormErrors extends Partial<Record<keyof FormValues, string>> {
  images?: string;
  amenities?: string;
}

interface ImageUploadProps {
  images: Record<string, File | null>;
  onImageChange: (key: string, file: File | null) => void;
  errors?: string[];
}

interface AmenitiesSelectProps {
  amenities: Record<string, boolean>;
  onChange: (amenities: Record<string, boolean>) => void;
}

// Image Upload Component
const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImageChange,
  errors,
}) => {
  const handleImageChange = useCallback(
    (key: string, file: File | null) => {
      if (file) {
        // Validate file type
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.error("Please upload only JPEG, PNG, or WebP images");
          return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error("Image size should be less than 5MB");
          return;
        }
      }

      onImageChange(key, file);
    },
    [onImageChange]
  );

  return (
    <div className="space-y-2">
      <p className="text-gray-800 font-medium">
        Images <span className="text-red-500">*</span>
      </p>
      <p className="text-sm text-gray-600">
        Upload up to {MAX_IMAGES} images (JPEG, PNG, WebP - max 5MB each)
      </p>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: MAX_IMAGES }, (_, index) => {
          const key = (index + 1).toString();
          const image = images[key];

          return (
            <div key={key} className="relative max-w-20">
              <label
                htmlFor={`roomImage${key}`}
                className="block cursor-pointer group"
                aria-label={`Upload image ${index + 1}`}
              >
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-primary transition-colors">
                  <img
                    src={image ? URL.createObjectURL(image) : assets.uploadArea}
                    alt={image ? `Room image ${index + 1}` : "Upload area"}
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                  />
                </div>

                {image && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      handleImageChange(key, null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </label>

              <input
                type="file"
                id={`roomImage${key}`}
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                hidden
                onChange={(e) =>
                  handleImageChange(key, e.target.files?.[0] || null)
                }
              />
            </div>
          );
        })}
      </div>

      {errors && errors.length > 0 && (
        <div className="text-red-500 text-sm space-y-1">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};

// Amenities Selection Component
const AmenitiesSelect: React.FC<AmenitiesSelectProps> = ({
  amenities,
  onChange,
}) => {
  const handleAmenityChange = useCallback(
    (amenityKey: string, checked: boolean) => {
      onChange({
        ...amenities,
        [amenityKey]: checked,
      });
    },
    [amenities, onChange]
  );

  return (
    <div className="space-y-2">
      <p className="text-gray-800 font-medium">Amenities</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(amenities).map(([amenityKey, amenityValue]) => (
          <label
            key={amenityKey}
            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
          >
            <input
              type="checkbox"
              checked={amenityValue}
              onChange={(e) =>
                handleAmenityChange(amenityKey, e.target.checked)
              }
              className="rounded border-gray-300 text-primary"
            />
            <span className="text-gray-700 select-none">{amenityKey}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

const initialImagesState = () => {
  const initialState: Record<string, File | null> = {};
  for (let i = 1; i <= MAX_IMAGES; i++) {
    initialState[i.toString()] = null;
  }
  return initialState;
};

const AddRoom = () => {
  const { axios, getToken } = useAppContext();

  const [images, setImages] =
    useState<Record<string, File | null>>(initialImagesState);

  // Form validation rules
  const validationRules = useMemo(
    (): ValidationRules => ({
      roomType: ROOM_VALIDATION_RULES.roomType!,
      pricePerNight: ROOM_VALIDATION_RULES.pricePerNight!,
    }),
    []
  );

  // Custom validation function
  const validateFormData = useCallback(
    (values: FormValues): FormErrors => {
      const errors: FormErrors = validateForm(values, validationRules);

      // Validate images
      const hasImages = Object.values(images).some((image) => image !== null);
      if (!hasImages) {
        errors.images = "At least one image is required";
      }

      // Validate amenities (at least one should be selected)
      const hasAmenities = Object.values(values.amenities).some(Boolean);
      if (!hasAmenities) {
        errors.amenities = "Please select at least one amenity";
      }

      return errors;
    },
    [images, validationRules]
  );

  // Form management with useForm hook
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useForm<FormValues>({
    initialValues: {
      roomType: "",
      pricePerNight: "",
      amenities: { ...DEFAULT_AMENITIES },
    },
    validate: validateFormData,
    onSubmit: async (formValues) => {
      await submitRoom(formValues);
    },
  });

  // Image change handler
  const handleImageChange = useCallback((key: string, file: File | null) => {
    setImages((prev) => ({ ...prev, [key]: file }));
  }, []);

  // Amenities change handler
  const handleAmenitiesChange = useCallback(
    (newAmenities: Record<string, boolean>) => {
      setFieldValue("amenities", newAmenities);
    },
    [setFieldValue]
  );

  // Submit handler
  const submitRoom = async (formValues: FormValues) => {
    try {
      const formData = new FormData();

      // Append form fields
      formData.append("roomType", formValues.roomType);
      formData.append("pricePerNight", formValues.pricePerNight);

      // Append selected amenities
      const selectedAmenities = Object.keys(formValues.amenities).filter(
        (amenity) => formValues.amenities[amenity]
      );
      formData.append("amenities", JSON.stringify(selectedAmenities));

      // Append images
      Object.values(images).forEach((image) => {
        if (image) {
          formData.append("images", image);
        }
      });

      const { data }: { data: ApiResponse<Room> } = await axios.post(
        "/api/rooms",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Room added successfully!");

        // Reset form and images
        resetForm();
        setImages(initialImagesState);
      } else {
        toast.error(data.message || "Failed to add room");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-6">
      <Title align="left" font="outfit" title="Add Room" />

      <form onSubmit={handleSubmit} className="space-y-8 mt-8">
        {/* Image Upload Section */}
        <ImageUpload
          images={images}
          onImageChange={handleImageChange}
          errors={
            (errors as FormErrors).images
              ? [(errors as FormErrors).images!]
              : undefined
          }
        />

        {/* Room Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Room Type */}
          <div className="space-y-2">
            <label
              htmlFor="roomType"
              className="block text-gray-800 font-medium"
            >
              Room Type <span className="text-red-500">*</span>
            </label>
            <select
              id="roomType"
              name="roomType"
              value={values.roomType}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                errors.roomType && touched.roomType
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              aria-describedby={
                errors.roomType && touched.roomType
                  ? "roomType-error"
                  : undefined
              }
            >
              <option value="">Select Room Type</option>
              {ROOM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.roomType && touched.roomType && (
              <p id="roomType-error" className="text-red-500 text-sm">
                {errors.roomType}
              </p>
            )}
          </div>

          {/* Price Per Night */}
          <div className="space-y-2">
            <label
              htmlFor="pricePerNight"
              className="block text-gray-800 font-medium"
            >
              Price per Night ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="pricePerNight"
              name="pricePerNight"
              value={values.pricePerNight}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0"
              min="1"
              step="0.01"
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                errors.pricePerNight && touched.pricePerNight
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              aria-describedby={
                errors.pricePerNight && touched.pricePerNight
                  ? "pricePerNight-error"
                  : undefined
              }
            />
            {errors.pricePerNight && touched.pricePerNight && (
              <p id="pricePerNight-error" className="text-red-500 text-sm">
                {errors.pricePerNight}
              </p>
            )}
          </div>
        </div>

        {/* Amenities Section */}
        <div className="space-y-2">
          <AmenitiesSelect
            amenities={values.amenities}
            onChange={handleAmenitiesChange}
          />
          {errors.amenities && (
            <p className="text-red-500 text-sm">{errors.amenities}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-dark text-white hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding Room...</span>
              </div>
            ) : (
              "Add Room"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoom;
