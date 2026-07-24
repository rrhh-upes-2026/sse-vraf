"use client";

import { useState, useCallback } from "react";

type Errors<T> = Partial<Record<keyof T, string>>;
type Validator<T> = (form: T) => Errors<T>;

/**
 * Single form-state mechanism for all workspace modules.
 * Replaces setField / patch / field() / handleChange patterns.
 *
 * Usage:
 *   const { form, errors, setField, setErrors, reset, validate } =
 *     useFormState(EMPTY_FORM, validateMyForm);
 */
export function useFormState<T extends Record<string, unknown>>(
  emptyForm: T,
  validator?: Validator<T>,
) {
  const [form, setForm]     = useState<T>(emptyForm);
  const [errors, setErrors] = useState<Errors<T>>({});

  /** Update a single field and clear its error */
  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  /** Reset form to empty (or a custom initial state) and clear all errors */
  const reset = useCallback((initial: T = emptyForm) => {
    setForm(initial);
    setErrors({});
  }, [emptyForm]);

  /** Run validation; returns true if no errors */
  const validate = useCallback((): boolean => {
    if (!validator) return true;
    const errs = validator(form);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [form, validator]);

  return { form, setForm, errors, setErrors, setField, reset, validate };
}
