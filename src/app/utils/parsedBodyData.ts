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
    } else if (Array.isArray(value)) {
      parsed[key] = value.map((v) => parseMultipartBody(v));
    } else if (value?.type === "field") {
      parsed[key] = value.value;
    } else {
      parsed[key] = value;
    }
  }

  return parsed;
};

const isNumericKeyedObject = (obj: any) => {
  if (!obj || typeof obj !== "object") return false;
  const keys = Object.keys(obj);
  return keys.length > 0 && keys.every((k) => !isNaN(Number(k)));
};
