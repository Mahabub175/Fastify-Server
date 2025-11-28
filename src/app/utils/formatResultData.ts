import config from "../config/config";
import moment from "moment";

export const formatResultData = <T extends Record<string, any>>(
  results: T | T[],
  fields?: string | string[]
): T | T[] => {
  const normalizeField = (value: any): any => {
    if (!value) return value;

    if (typeof value === "string" && value.startsWith("uploads/")) {
      return `${config.base_url}/${value.replace(/\\/g, "/")}`;
    }

    if (Array.isArray(value)) {
      return value.map((v) =>
        typeof v === "string" && v.startsWith("uploads/")
          ? `${config.base_url}/${v.replace(/\\/g, "/")}`
          : v
      );
    }

    if (
      value instanceof Date ||
      moment(value, moment.ISO_8601, true).isValid()
    ) {
      return moment(value).local().format("YYYY-MM-DD HH:mm:ss");
    }

    return value;
  };

  const fieldList = Array.isArray(fields) ? fields : fields ? [fields] : [];

  const formatItem = (item: T): T => {
    const docData = (item as any)._doc || item;
    const newData: any = {};

    for (const key in docData) {
      newData[key] = normalizeField(docData[key]);
    }

    for (const key of fieldList) {
      newData[key] = normalizeField(docData[key]);
    }

    return newData as T;
  };

  if (Array.isArray(results)) {
    return results.map(formatItem);
  } else {
    return formatItem(results as T);
  }
};
