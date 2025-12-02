import config from "../config/config";

export const formatResultData = <T extends Record<string, any>>(
  results: T | T[],
  fields?: string | string[]
): T | T[] => {
  const isLikelyISODate = (value: any): boolean => {
    return (
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)
    );
  };

  const normalizeField = (value: any): any => {
    if (!value) return value;

    if (typeof value === "string") {
      if (value.startsWith("uploads/")) {
        return `${config.base_url}/${value.replace(/\\/g, "/")}`;
      }
      if (isLikelyISODate(value)) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
          return d.toISOString().replace("T", " ").substring(0, 19);
        }
      }
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString().replace("T", " ").substring(0, 19);
    }

    if (Array.isArray(value)) {
      return value.map((v) =>
        typeof v === "string" && v.startsWith("uploads/")
          ? `${config.base_url}/${v.replace(/\\/g, "/")}`
          : v instanceof Date
          ? v.toISOString().replace("T", " ").substring(0, 19)
          : v
      );
    }

    return value;
  };

  const fieldList = Array.isArray(fields) ? fields : fields ? [fields] : [];

  const formatItem = (item: T): T => {
    const source = (item as any)._doc || item;
    const formatted: any = {};

    for (const key in source) {
      formatted[key] = normalizeField(source[key]);
    }

    for (const key of fieldList) {
      formatted[key] = normalizeField(source[key]);
    }

    return formatted as T;
  };

  return Array.isArray(results) ? results.map(formatItem) : formatItem(results);
};
