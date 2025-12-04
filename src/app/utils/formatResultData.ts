import mongoose from "mongoose";
import config from "../config/config";

const BASE_URL = config.base_url;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

const formatDate = (value: Date | string) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toISOString().replace("T", " ").substring(0, 19);
};

const isObjectId = (v: any) =>
  v instanceof mongoose.Types.ObjectId || v?._bsontype === "ObjectID";

const formatValue = (value: any): any => {
  if (value == null) return value;

  if (typeof value === "string") {
    if (value.startsWith("uploads/"))
      return BASE_URL + "/" + value.replace("//g", "/");
    if (ISO_DATE_REGEX.test(value)) return formatDate(value);
    return value;
  }

  if (value instanceof Date) return formatDate(value);

  if (Array.isArray(value)) return value.map(formatValue);

  if (typeof value === "object") {
    if (isObjectId(value)) return value.toString();
    if (value?.buffer?.data && Array.isArray(value.buffer.data))
      return Buffer.from(value.buffer.data).toString("hex");

    const formatted: any = {};
    for (const k in value) {
      if (k === "__v") continue;
      formatted[k] = formatValue(value[k]);
    }
    return formatted;
  }

  return value;
};

export const formatResultData = <T extends Record<string, any>>(
  results: T | T[],
  fields?: string | string[]
): T | T[] => {
  const fieldSet = fields
    ? new Set(Array.isArray(fields) ? fields : [fields])
    : null;

  const formatItem = (item: T): T => {
    const src = (item as any)._doc || item;
    const baseFormatted = formatValue(src);

    if (fieldSet) {
      for (const f of fieldSet) {
        if (src[f] !== undefined) baseFormatted[f] = formatValue(src[f]);
      }
    }

    return baseFormatted as T;
  };

  return Array.isArray(results) ? results.map(formatItem) : formatItem(results);
};
