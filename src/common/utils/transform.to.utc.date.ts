export const transformToUtcDate = ({ value }: { value: any }) => {
  if (!value) return undefined;

  if (typeof value === 'string') {
    const parts = value.split('-').map(Number);

    // Check format correctness
    if (
      parts.length !== 3 ||
      parts.some(isNaN) ||
      parts[0] < 1000 ||
      parts[1] < 1 ||
      parts[1] > 12 ||
      parts[2] < 1 ||
      parts[2] > 31
    ) {
      return undefined;
    }

    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }

  return undefined;
};
