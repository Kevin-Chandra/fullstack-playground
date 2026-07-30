import lodashIsEqual from "lodash.isequal";

export function isEqual<T>(a: T, b: T): boolean {
  return lodashIsEqual(a, b);
}
