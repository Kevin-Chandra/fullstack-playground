import { Type } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../decorators/public.decorator";

/**
 * Whether an anonymous request would reach `route`.
 *
 * Controllers are guarded class-wide with `JwtGuard` and routes opt out one at
 * a time with `@Public()`, so this is the question every controller spec is
 * really asking. It resolves the metadata the way the guard does — handler
 * first, then the class, through `getAllAndOverride` — so a class-level
 * `@Public()` counts, and a change to how the decorator stores its flag has
 * one place to be chased instead of one per spec.
 */
export const isPublicRoute = <T>(
  controller: Type<T>,
  route: keyof T,
): boolean => {
  const handler = Object.getOwnPropertyDescriptor(controller.prototype, route)
    .value as (...args: never[]) => unknown;

  return (
    new Reflector().getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]) ?? false
  );
};
