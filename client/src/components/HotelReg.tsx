import { useState, useCallback, useMemo, useEffect, useRef } from "react";
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
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<HotelFormData>({
    name: "",
    address: "",
    contact: "",
    city: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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

  // Modal animation and focus management
  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Focus first input when modal opens
    const timer = setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) {
        handleCloseModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSubmitting]);

  const handleCloseModal = useCallback(() => {
    if (!isSubmitting) {
      setIsVisible(false);
    }
  }, [isSubmitting]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCloseModal();
      }
    },
    [handleCloseModal]
  );

  // Memoized form field configurations
  const formFields = useMemo(
    () => [
      {
        id: "name" as const,
        label: "Hotel Name *",
        type: "text" as const,
        placeholder: "Enter hotel name",
        value: formData.name,
        isFirst: true,
      },
      {
        id: "contact" as const,
        label: "Phone Number *",
        type: "tel" as const,
        placeholder: "Enter phone number",
        value: formData.contact,
        isFirst: false,
      },
      {
        id: "address" as const,
        label: "Address *",
        type: "text" as const,
        placeholder: "Enter hotel address",
        value: formData.address,
        isFirst: false,
      },
    ],
    [formData.name, formData.contact, formData.address]
  );

  const inputClassName = useMemo(
    () =>
      "border border-gray-200 rounded-lg w-full px-4 py-3 mt-2 outline-none font-light focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed",
    []
  );

  const modalBackdropClassName = useMemo(
    () =>
      `fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isVisible
          ? "bg-black/60 backdrop-blur-sm opacity-100"
          : "bg-black/0 backdrop-blur-none opacity-0"
      } ${className || ""}`,
    [isVisible, className]
  );

  const modalContentClassName = useMemo(
    () =>
      `relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-all duration-300 transform ${
        isVisible
          ? "scale-100 opacity-100 translate-y-0"
          : "scale-95 opacity-0 translate-y-4"
      }`,
    [isVisible]
  );

  return (
    <div
      ref={modalRef}
      className={modalBackdropClassName}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div className={modalContentClassName}>
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - Image */}
          <div className="hidden md:block md:w-1/2 relative overflow-hidden">
            <img
              src={assets.regImage}
              alt="Hotel registration illustration"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20" />
          </div>

          {/* Right side - Form */}
          <div className="flex-1 md:w-1/2 relative">
            {/* Close button */}
            <button
              type="button"
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50 group"
              onClick={handleCloseModal}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              <img
                src={assets.closeIcon}
                alt="Close"
                className="w-4 h-4 group-hover:scale-110 transition-transform"
              />
            </button>

            {/* Form content */}
            <div className="h-full overflow-y-auto">
              <form
                onSubmit={onSubmitHandler}
                noValidate
                className="p-6 md:p-8 lg:p-10 space-y-4"
              >
                <div className="text-center mb-6">
                  <h2
                    id="modal-title"
                    className="text-2xl md:text-3xl font-bold text-gray-800 mb-2"
                  >
                    Register Your Hotel
                  </h2>
                  <p
                    id="modal-description"
                    className="text-gray-600 text-sm md:text-base"
                  >
                    Join our platform and start welcoming guests today
                  </p>
                </div>

                <div className="space-y-4">
                  {formFields.map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="block text-sm font-semibold text-gray-700"
                      >
                        {field.label}
                      </label>
                      <input
                        ref={field.isFirst ? firstInputRef : undefined}
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

                  <div className="space-y-2">
                    <label
                      htmlFor="city"
                      className="block text-sm font-semibold text-gray-700"
                    >
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
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-200 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering Hotel...</span>
                      </>
                    ) : (
                      <>
                        <span>Register Hotel</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelReg;
