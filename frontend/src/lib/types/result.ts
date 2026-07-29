export type Result<T, ErrorEntity> =
  | { success: true; data: T }
  | { success: false; error: ErrorEntity };
