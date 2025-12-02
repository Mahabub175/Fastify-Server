import { Query } from "mongoose";
import { formatResultData } from "./formatResultData";

type FilterValue =
  | string
  | number
  | boolean
  | { from?: any; to?: any }
  | { $in: any[] };

interface SortOptions {
  field?: string;
  order?: "asc" | "desc";
}

interface PaginateOptions {
  searchText?: string;
  searchFields?: string[];
  filters?: Record<string, FilterValue>;
  sort?: SortOptions;
}

export const paginateAndSort = async <T extends Record<string, any>>(
  query: Query<T[], T>,
  options: PaginateOptions = {}
) => {
  const {
    searchText = "",
    searchFields = [],
    filters = {},
    sort = { field: "createdAt", order: "desc" },
  } = options;

  const page = Number(filters.page) > 0 ? Number(filters.page) : 1;
  const limit = Number(filters.limit) > 0 ? Number(filters.limit) : undefined;

  delete filters.page;
  delete filters.limit;

  const filterObj: Record<string, any> = {};

  for (const key in filters) {
    const value = filters[key];
    if (value == null) continue;

    if (typeof value === "string") {
      filterObj[key] = /[a-zA-Z]/.test(value) ? new RegExp(value, "i") : value;
    } else if (typeof value === "object") {
      if ("from" in value || "to" in value) {
        const range: Record<string, any> = {};
        if (value.from !== undefined) range.$gte = value.from;
        if (value.to !== undefined) range.$lte = value.to;
        filterObj[key] = range;
      } else if ("$in" in value && Array.isArray((value as any).$in)) {
        filterObj[key] = { $in: (value as any).$in };
      } else {
        filterObj[key] = value;
      }
    } else {
      filterObj[key] = value;
    }
  }

  if (!("isDeleted" in filters)) {
    filterObj.isDeleted = false;
  }

  if (searchText && searchFields.length > 0) {
    const regex = new RegExp(searchText, "i");
    filterObj.$or = searchFields.map((f) => ({ [f]: regex }));
  }

  const isPaginated = !!limit;
  const skip = isPaginated ? (page - 1) * limit : 0;

  let baseQuery = query.find(filterObj).sort({
    [sort.field!]: sort.order === "desc" ? -1 : 1,
    _id: -1,
  });

  if (isPaginated) baseQuery = baseQuery.skip(skip).limit(limit);

  const results = await baseQuery.lean().exec();

  const totalCount = isPaginated
    ? await query.model.countDocuments(filterObj)
    : results.length;

  const formatted = new Array(results.length);
  for (let i = 0; i < results.length; i++) {
    formatted[i] = formatResultData(results[i]);
  }

  return {
    pagination: {
      page,
      limit: limit ?? 0,
      totalCount,
      totalPages: isPaginated ? Math.ceil(totalCount / limit!) : 1,
    },
    results: formatted,
  };
};
