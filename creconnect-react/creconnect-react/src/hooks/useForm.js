import { useState, useCallback } from 'react';

/**
 * Generic controlled-form hook.
 *
 * @param {Record<string, string>} initialValues
 * @param {(values: Record<string,string>) => Record<string,string>} validateFn
 *   Should return a map of field → error message (empty object = valid).
 *
 * @returns {{ values, errors, touched, isValid, handleChange, handleBlur, reset, setFieldValue }}
 */
export function useForm(initialValues = {}, validateFn = () => ({})) {
  const [values,  setValues]  = useState(initialValues);
  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});

  const isValid = Object.values(values).every((v) => String(v).trim() !== '') &&
                  Object.keys(errors).length === 0;

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === 'checkbox' ? checked : value };
    setValues(next);
    const errs = validateFn(next);
    setErrors(errs);
  }, [values, validateFn]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateFn(values));
  }, [values, validateFn]);

  const setFieldValue = useCallback((name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    setErrors(validateFn(next));
  }, [values, validateFn]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return { values, errors, touched, isValid, handleChange, handleBlur, reset, setFieldValue };
}
