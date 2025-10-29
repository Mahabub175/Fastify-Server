import { Query } from "mongoose";

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
  page?: number;
  limit?: number;
  searchText?: string;
  searchFields?: string[];
  filters?: Record<string, FilterValue>;
  sort?: SortOptions;
}

const buildFilters = (filters: Record<string, FilterValue>) => {
  const queryObj: Record<string, any> = {};
  for (const key in filters) {
    const value = filters[key];
    if (typeof value === "string") {
      queryObj[key] = new RegExp(value, "i");
    } else if (typeof value === "object" && value !== null) {
      if ("from" in value || "to" in value) {
        queryObj[key] = {};
        if (value.from !== undefined) queryObj[key]["$gte"] = value.from;
        if (value.to !== undefined) queryObj[key]["$lte"] = value.to;
      } else if ("$in" in value) {
        queryObj[key] = { $in: value.$in };
      } else {
        queryObj[key] = value;
      }
    } else {
      queryObj[key] = value;
    }
  }
  return queryObj;
};

export const paginateAndSort = async <T>(
  query: Query<T[], T>,
  options: PaginateOptions = {}
) => {
  const {
    page = 1,
    limit = 10,
    searchText = "",
    searchFields = [],
    filters = {},
    sort = { field: "createdAt", order: "desc" },
  } = options;

  const pageNumber = Math.max(1, page);
  const pageSize = Math.max(1, limit);
  const skip = (pageNumber - 1) * pageSize;

  const filterObj = buildFilters(filters);

  if (searchText && searchFields.length) {
    const regex = new RegExp(searchText, "i");
    filterObj["$or"] = searchFields.map((field) => ({ [field]: regex }));
  }

  const totalCount = await query.model.countDocuments(filterObj).exec();

  const results = await query
    .find(filterObj)
    .sort({
      [sort.field!]: sort.order === "desc" ? -1 : 1,
      _id: -1,
    })
    .skip(skip)
    .limit(pageSize)
    .exec();

  return {
    results,
    meta: {
      page: pageNumber,
      limit: pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};
