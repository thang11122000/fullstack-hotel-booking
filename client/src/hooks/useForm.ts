import { useState, useCallback, ChangeEvent } from "react";

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleBlur: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const validateField = useCallback(
    (field: keyof T) => {
      if (!validate) return;

      const fieldErrors = validate(values);
      setErrors((prev) => ({
        ...prev,
        [field]: fieldErrors[field] || undefined,
      }));
    },
    [values, validate]
  );

  const validateForm = useCallback((): boolean => {
    if (!validate) return true;

    const formErrors = validate(values);
    setErrors(formErrors);

    return Object.keys(formErrors).length === 0;
  }, [values, validate]);

  const handleChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name, value, type } = e.target;

      let finalValue: any = value;

      // Handle different input types
      if (type === "checkbox") {
        finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === "number") {
        finalValue = value === "" ? "" : Number(value);
      }

      setValues((prev) => ({
        ...prev,
        [name]: finalValue,
      }));

      // Clear error when user starts typing
      if (errors[name as keyof T]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const { name } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      validateField(name as keyof T);
    },
    [validateField]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!onSubmit) return;

      setIsSubmitting(true);

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        {} as Partial<Record<keyof T, boolean>>
      );

      setTouched(allTouched);

      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      try {
        await onSubmit(values);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit, validateForm]
  );

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    validateField,
    validateForm,
  };
};
