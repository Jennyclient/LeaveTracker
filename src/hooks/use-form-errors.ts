"use client";

import { useCallback, useState } from "react";

export function useFormErrors<T extends string>() {
  const [errors, setErrors] = useState<Partial<Record<T, string>>>({});

  const setFormErrors = useCallback((next: Partial<Record<T, string>>) => {
    setErrors(next);
  }, []);

  const clearFieldError = useCallback((field: T) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    setFormErrors,
    clearFieldError,
    clearAllErrors,
  };
}
