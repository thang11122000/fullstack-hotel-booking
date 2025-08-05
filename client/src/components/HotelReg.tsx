import { useState, useCallback, useMemo } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import type { ApiResponse, Hotel } from "../types";

interface HotelFormData {
  name: string;
  address: string;
  contact: string;
  city: string;
}

interface HotelRegProps {
  className?: string;
}

type FormField = keyof HotelFormData;

interface ValidationError {
  field: FormField;
  message: string;
}

const HotelReg = ({ className }: HotelRegProps) => {
  const { setShowHotelReg, axios, getToken, setIsOwner } = useAppContext();

  const [formData, setFormData] = useState<HotelFormData>({
    name: "",
    address: "",
    contact: "",
    city: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormData = useMemo<HotelFormData>(
    () => ({
      name: "",
      address: "",
      contact: "",
      city: "",
    }),
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name as FormField]: value,
      }));
    },
    []
  );

  const validateForm = useCallback((): ValidationError | null => {
    const { name, address, contact, city } = formData;

    if (!name.trim()) {
      return { field: "name", message: "Hotel name is required" };
    }

    if (!address.trim()) {
      return { field: "address", message: "Address is required" };
    }

    if (!contact.trim()) {
      return { field: "contact", message: "Contact number is required" };
    }

    if (!city) {
      return { field: "city", message: "Please select a city" };
    }

    return null;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const onSubmitHandler = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const validationError = validateForm();
      if (validationError) {
        toast.error(validationError.message);
        return;
      }

      setIsSubmitting(true);

      try {
        const token = await getToken();
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const { data } = await axios.post<ApiResponse<Hotel>>(
          "/api/hotels",
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success(data.message || "Hotel registered successfully!");
          setIsOwner(true);
          setShowHotelReg(false);
          resetForm();
        } else {
          toast.error(data.message || "Failed to register hotel");
        }
      } catch (error: unknown) {
        let errorMessage = "An unexpected error occurred";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      getToken,
      axios,
      formData,
      setIsOwner,
      setShowHotelReg,
      resetForm,
    ]
  );

  const handleCloseModal = useCallback(() => {
    if (!isSubmitting) {
      setShowHotelReg(false);
    }
  }, [isSubmitting, setShowHotelReg]);

  // Memoized form field configurations
  const formFields = useMemo(
    () => [
      {
        id: "name" as const,
        label: "Hotel Name *",
        type: "text" as const,
        placeholder: "Enter hotel name",
        value: formData.name,
      },
      {
        id: "contact" as const,
        label: "Phone Number *",
        type: "tel" as const,
        placeholder: "Enter phone number",
        value: formData.contact,
      },
      {
        id: "address" as const,
        label: "Address *",
        type: "text" as const,
        placeholder: "Enter hotel address",
        value: formData.address,
      },
    ],
    [formData.name, formData.contact, formData.address]
  );

  const inputClassName = useMemo(
    () =>
      "border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light focus:border-indigo-500 transition-colors",
    []
  );

  return (
    <div
      className={`fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70 ${className || ""}`}
      onClick={handleCloseModal}
    >
      <form
        className="flex bg-white rounded-xl max-w-4xl max-md:mx-2"
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        noValidate
      >
        <img
          src={assets.regImage}
          alt="Hotel registration illustration"
          className="w-1/2 rounded-xl hidden md:block"
        />
        <div className="relative flex flex-col items-center md:w-1/2 p-8 md:p-10">
          <button
            type="button"
            className="absolute top-4 right-4 h-4 w-4 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleCloseModal}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <img src={assets.closeIcon} alt="Close" className="w-full h-full" />
          </button>

          <h2 className="text-2xl font-semibold mt-6">Register Your Hotel</h2>

          {formFields.map((field) => (
            <div key={field.id} className="w-full mt-4">
              <label htmlFor={field.id} className="font-medium text-gray-500">
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                className={inputClassName}
                required
                value={field.value}
                onChange={handleInputChange}
                disabled={isSubmitting}
                aria-describedby={`${field.id}-error`}
              />
            </div>
          ))}

          <div className="w-full mt-4">
            <label htmlFor="city" className="font-medium text-gray-500">
              City *
            </label>
            <select
              id="city"
              name="city"
              className={inputClassName}
              required
              value={formData.city}
              onChange={handleInputChange}
              disabled={isSubmitting}
              aria-describedby="city-error"
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all text-white mr-auto px-6 py-2 rounded mt-6 flex items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              "Register Hotel"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;
