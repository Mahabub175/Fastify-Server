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

    if (value === null || value === undefined) continue;

    if (typeof value === "string") {
      filterObj[key] = /[a-zA-Z]/.test(value) ? new RegExp(value, "i") : value;
    } else if (typeof value === "object") {
      if ("from" in value || "to" in value) {
        filterObj[key] = {};
        if (value.from) filterObj[key].$gte = value.from;
        if (value.to) filterObj[key].$lte = value.to;
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

  let baseQuery = query
    .find(filterObj)
    .sort({ [sort.field!]: sort.order === "desc" ? -1 : 1 });

  if (isPaginated) {
    baseQuery = baseQuery.skip(skip).limit(limit);
  }

  const [results, totalCount] = await Promise.all([
    baseQuery.lean().exec(),
    isPaginated ? query.model.countDocuments(filterObj) : Promise.resolve(0),
  ]);

  const formatted = results.map((r) => formatResultData(r));

  return {
    pagination: {
      page,
      limit: limit ?? 0,
      totalCount: isPaginated ? totalCount : results.length,
      totalPages: isPaginated ? Math.ceil(totalCount / limit!) : 1,
    },
    results: formatted,
  };
};

