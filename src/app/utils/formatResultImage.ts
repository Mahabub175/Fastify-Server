import config from "../config/config";

export const formatResultImage = <T extends { [key: string]: any }>(
  results: T[] | string,
  fields?: string | string[]
): T[] | string => {
  const normalizeField = (item: any, field: string) => {
    const value = item[field];
    if (!value) return value;

    if (Array.isArray(value)) {
      return value.map((v) => `${config.base_url}/${v.replace(/\\/g, "/")}`);
    } else if (typeof value === "string") {
      return `${config.base_url}/${value.replace(/\\/g, "/")}`;
    }
    return value;
  };

  const fieldList = Array.isArray(fields) ? fields : fields ? [fields] : [];

  const formatItem = (item: T): T => {
    const docData = (item as any)._doc || item;

    const newData = { ...docData };
    for (const field of fieldList) {
      newData[field] = normalizeField(docData, field);
    }
    return newData as T;
  };

  if (Array.isArray(results)) {
    return results.map(formatItem);
  } else if (typeof results === "string") {
    return `${config.base_url}/${results.replace(/\\/g, "/")}`;
  } else {
    throw new Error("Unexpected results format");
  }
};
