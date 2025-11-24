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
    page,
    limit,
    searchText = "",
    searchFields = [],
    filters = {},
    sort = { field: "createdAt", order: "desc" },
  } = options;

  const filterObj: Record<string, any> = buildFilters(filters);
  if (!("isDeleted" in filterObj)) {
    filterObj.isDeleted = false;
  }

  if (searchText && searchFields.length) {
    const regex = new RegExp(searchText, "i");
    filterObj["$or"] = searchFields.map((field) => ({ [field]: regex }));
  }

  const totalCount = await query.model.countDocuments(filterObj).exec();

  const isPaginationProvided =
    typeof page !== "undefined" && typeof limit !== "undefined";

  const pageNumber = isPaginationProvided ? Math.max(1, page!) : 1;
  const pageSize = isPaginationProvided ? Math.max(1, limit!) : totalCount;
  const totalPages = isPaginationProvided
    ? Math.ceil(totalCount / pageSize)
    : 1;

  const skip = isPaginationProvided ? (pageNumber - 1) * pageSize : 0;

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
    pagination: {
      page: pageNumber,
      limit: pageSize,
      totalCount,
      totalPages,
    },
  };
};
