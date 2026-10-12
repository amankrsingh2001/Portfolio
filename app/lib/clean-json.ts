import type { Prisma } from "../../generated/prisma/client";

/**
 * Event details become plain JSON: primitives, arrays and plain objects only, at most
 * four levels deep. Keys starting with `$` are dropped because Prisma reads objects
 * with a `$type` key as tagged values (and throws on unknown ones).
 */
export function cleanJson(value: unknown, depth = 0): Prisma.InputJsonValue | null {
  if (value === null || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (depth >= 4) return null;
  if (Array.isArray(value)) return value.map((item) => cleanJson(item, depth + 1));
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith("$") && key !== "__proto__")
        .map(([key, item]) => [key, cleanJson(item, depth + 1)]),
    );
  }
  return null;
}
