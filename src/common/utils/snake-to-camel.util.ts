export const toCamel = (str: string) =>
  str.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

export function keysToCamel<T extends Record<string, unknown> | unknown[]>(
  obj: T,
): T {
  if (Array.isArray(obj)) {
    // Map over array and convert objects inside
    return obj.map((item) =>
      typeof item === 'object' && item !== null
        ? keysToCamel(item as Record<string, unknown>)
        : item,
    ) as T;
  }

  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => {
        const newKey = toCamel(key);
        acc[newKey] =
          typeof value === 'object' && value !== null
            ? keysToCamel(value as Record<string, unknown>)
            : value;
        return acc;
      },
      {} as Record<string, unknown>,
    ) as T;
  }

  return obj;
}
