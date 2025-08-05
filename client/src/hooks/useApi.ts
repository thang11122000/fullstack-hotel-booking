import { useState, useCallback } from "react";
import { useAppContext } from "../context/AppContext";
import type { ApiResponse } from "../types";
import toast from "react-hot-toast";

interface UseApiOptions {
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (url: string, options?: RequestInit) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = unknown>(
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const {
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
  } = options;

  const { axios, getToken } = useAppContext();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (url: string, config: any = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        // Add authorization header if needed
        if (config.requireAuth !== false) {
          const token = await getToken();
          if (token) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            };
          }
        }

        const response = await axios<ApiResponse<T>>(url, config);
        const responseData = response.data;

        if (responseData.success && responseData.data) {
          setData(responseData.data);

          if (showSuccessToast) {
            toast.success(
              successMessage || responseData.message || "Operation successful"
            );
          }

          return responseData.data;
        } else {
          const errorMsg = responseData.message || "Operation failed";
          setError(errorMsg);

          if (showErrorToast) {
            toast.error(errorMsg);
          }

          return null;
        }
      } catch (err: unknown) {
        let errorMessage = "An unexpected error occurred";

        if (axios.isAxiosError(err)) {
          errorMessage = err.response?.data?.message || err.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        setError(errorMessage);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        console.error("API Error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [axios, getToken, showSuccessToast, showErrorToast, successMessage]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
