export const FORM_DEFAULT_VALIDATION_MODE = "onBlur";

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
