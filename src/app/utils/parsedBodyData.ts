export const parseMultipartBody = (body: Record<string, any>) => {
  const parsed: Record<string, string> = {};
  for (const key in body) {
    if (body[key]?.type === "field") parsed[key] = body[key].value;
    else parsed[key] = body[key];
  }
  return parsed;
};
