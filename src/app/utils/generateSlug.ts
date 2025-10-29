import slugify from "slugify";

export const generateSlug = (input: string): string => {
  const baseSlug = slugify(input, {
    lower: true,
    strict: true,
    replacement: "-",
  });

  return `${baseSlug}`;
};
