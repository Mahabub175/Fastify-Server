const isNumericKeyedObject = (obj: any) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every((k) => !isNaN(Number(k)));
};

const tryParseJSON = (value: any) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return value;
    }
  }

  return value;
};

const isFileObject = (value: any) => {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value.file || value.filename || value.mimetype || value.type === "file")
  );
};

export const parseMultipartBody = (body: Record<string, any>): any => {
  if (isNumericKeyedObject(body)) {
    return Object.keys(body)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => parseMultipartBody(body[k]));
  }

  const parsed: Record<string, any> = {};

  for (const key in body) {
    const value = body[key];

    if (isNumericKeyedObject(value)) {
      parsed[key] = Object.keys(value)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => parseMultipartBody(value[k]));
      continue;
    }

    if (value?.type === "field") {
      parsed[key] = tryParseJSON(value.value);
      continue;
    }

    if (isFileObject(value)) {
      parsed[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      parsed[key] = value.map((v) =>
        isFileObject(v) ? v : parseMultipartBody(v)
      );
      continue;
    }

    if (typeof value === "object" && value !== null) {
      parsed[key] = parseMultipartBody(value);
      continue;
    }

    parsed[key] = tryParseJSON(value);
  }

  return parsed;
};

export const parseQueryFilters = (
  rawQuery: Record<string, any>,
  searchTextKey = "searchText"
): { filters: Record<string, any>; searchText?: string } => {
  const filters: Record<string, any> = {};
  let searchText: string | undefined;

  for (const rawKey in rawQuery) {
    const value = rawQuery[rawKey];

    if (rawKey === searchTextKey) {
      searchText = value;
      continue;
    }

    if (value === undefined || value === "") continue;

    if (rawKey.endsWith("[from]") || rawKey.endsWith("[to]")) {
      const field = rawKey.replace(/\[(from|to)\]$/, "");
      filters[field] = filters[field] || {};

      if (rawKey.endsWith("[from]")) filters[field]["$gte"] = Number(value);
      if (rawKey.endsWith("[to]")) filters[field]["$lte"] = Number(value);

      continue;
    }

    const keys = rawKey.split(".");
    let current = filters;

    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];

      if (i === keys.length - 1) {
        let parsedValue: any = value;

        if (typeof value === "string") {
          if (value.startsWith("[") && value.endsWith("]")) {
            try {
              parsedValue = { $in: JSON.parse(value) };
            } catch {}
          } else if (value.includes(",")) {
            parsedValue = { $in: value.split(",") };
          } else if (value === "true" || value === "false") {
            parsedValue = value === "true";
          } else if (!isNaN(Number(value))) {
            parsedValue = Number(value);
          }
        }

        current[k] = parsedValue;
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    }
  }

  return { filters, searchText };
};
