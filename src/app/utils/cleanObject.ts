export const cleanObject = <T extends Record<string, any>>(
  obj: T
): Partial<T> => {
  const result: Partial<T> = { ...obj };
  Object.keys(result).forEach((key) => {
    if (result[key] === undefined || result[key] === null) {
      delete result[key];
    }
  });
  return result;
};
