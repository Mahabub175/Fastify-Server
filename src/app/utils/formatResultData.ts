import config from "../config/config";

const BASE_URL = config.base_url;

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const formatDate = (value: any): string => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toISOString().replace("T", " ").substring(0, 19);
};

export const formatResultData = <T extends Record<string, any>>(
  results: T | T[],
  fields?: string | string[]
): T | T[] => {
  const targetFields =
    fields === undefined ? null : Array.isArray(fields) ? fields : [fields];

  const formatValue = (value: any): any => {
    if (value == null) return value;

    if (typeof value === "string") {
      if (value.startsWith("uploads/")) {
        return BASE_URL + "/" + value.replace(/\\/g, "/");
      }

      if (ISO_DATE_REGEX.test(value)) {
        return formatDate(value);
      }

      return value;
    }

    if (value instanceof Date) {
      return formatDate(value);
    }

    if (Array.isArray(value)) {
      const len = value.length;
      if (len === 0) return value;

      const out = new Array(len);
      for (let i = 0; i < len; i++) {
        const v = value[i];

        if (typeof v === "string") {
          out[i] = v.startsWith("uploads/")
            ? BASE_URL + "/" + v.replace(/\\/g, "/")
            : ISO_DATE_REGEX.test(v)
            ? formatDate(v)
            : v;
        } else if (v instanceof Date) {
          out[i] = formatDate(v);
        } else {
          out[i] = v;
        }
      }
      return out;
    }

    return value;
  };

  const formatItem = (item: T): T => {
    const src = (item as any)._doc || item;

    const formatted: any = {};

    for (const key in src) {
      formatted[key] = formatValue(src[key]);
    }

    if (targetFields) {
      for (let i = 0; i < targetFields.length; i++) {
        const f = targetFields[i];
        formatted[f] = formatValue(src[f]);
      }
    }

    return formatted as T;
  };

  if (Array.isArray(results)) {
    const arr = results;
    const len = arr.length;
    const out = new Array(len);

    for (let i = 0; i < len; i++) {
      out[i] = formatItem(arr[i]);
    }

    return out;
  }

  return formatItem(results);
};
