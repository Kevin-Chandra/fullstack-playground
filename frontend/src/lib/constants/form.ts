export const FORM_DEFAULT_VALIDATION_MODE = "onBlur";

/*
 * Patterns
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
export const PHONE_PATTERN = /^\+\d[\d\s().-]*$/;

/*
 * User Form.
 */
export const USER_FORM_LIMITS = {
  name: { min: 2, max: 80 },
  username: { min: 3, max: 32 },
  password: { min: 8, max: 64 },
} as const;

export const USER_FORM_MESSAGES = {
  name: {
    required: "Full name is required",
    min: `Full name must be at least ${USER_FORM_LIMITS.name.min} characters`,
    max: `Full name must be at most ${USER_FORM_LIMITS.name.max} characters`,
  },
  username: {
    required: "Username is required",
    min: `Username must be at least ${USER_FORM_LIMITS.username.min} characters`,
    max: `Username must be at most ${USER_FORM_LIMITS.username.max} characters`,
    pattern: "Use only letters, numbers, and . _ -",
  },
  password: {
    required: "Password is required",
    min: `Password must be at least ${USER_FORM_LIMITS.password.min} characters`,
    max: `Password must be at most ${USER_FORM_LIMITS.password.max} characters`,
  },
} as const;

/*
 * Guest Form.
 */
export const GUEST_FORM_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  phoneNumber: { min: 8, max: 64 },
  pax: { min: 1 }
} as const;

export const GUEST_FORM_MESSAGES = {
  name: {
    required: "Full name is required",
    min: `Full name must be at least ${USER_FORM_LIMITS.name.min} characters`,
    max: `Full name must be at most ${USER_FORM_LIMITS.name.max} characters`,
  },
  pax: {
    required: "Party size is required",
    min: `Party size must be at least ${GUEST_FORM_LIMITS.pax.min}`,
  },
  email: {
    max: `Email must be at most ${GUEST_FORM_LIMITS.email.max} characters`,
    pattern: "Enter a valid email address",
  },
  phoneNumber: {
    min: `Phone number must be at least ${GUEST_FORM_LIMITS.phoneNumber.min} characters`,
    max: `Phone number must be at most ${GUEST_FORM_LIMITS.phoneNumber.max} characters`,
    pattern: "Invalid phone number format (e.g. +60123456789)",
  },
} as const;
