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
): Promise<{
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  results: T[];
}> => {
  const {
    searchText = "",
    searchFields = [],
    filters = {},
    sort = { field: "createdAt", order: "desc" },
  } = options;

  let page = 1;
  let limit: number | undefined = undefined;
  if ("page" in filters) {
    page = Number(filters.page) || 1;
    delete filters.page;
  }
  if ("limit" in filters) {
    limit = Number(filters.limit) || undefined;
    delete filters.limit;
  }

  const filterObj: Record<string, any> = {};
  for (const key in filters) {
    const value = filters[key];
    if (typeof value === "string") filterObj[key] = new RegExp(value, "i");
    else if (typeof value === "object" && value !== null) {
      if ("from" in value || "to" in value) {
        filterObj[key] = {};
        if (value.from !== undefined) filterObj[key]["$gte"] = value.from;
        if (value.to !== undefined) filterObj[key]["$lte"] = value.to;
      } else if ("$in" in value) {
        filterObj[key] = { $in: value.$in };
      } else {
        filterObj[key] = value;
      }
    } else filterObj[key] = value;
  }

  if (!Object.prototype.hasOwnProperty.call(filters, "isDeleted")) {
    filterObj.isDeleted = { $in: [false, null, undefined] };
  }

  if (searchText && searchFields.length > 0) {
    const regex = new RegExp(searchText, "i");
    filterObj["$or"] = searchFields.map((f) => ({ [f]: regex }));
  }

  const isPaginationProvided = limit !== undefined;
  const pageNumber = isPaginationProvided ? Math.max(1, page) : 1;
  const pageSize = isPaginationProvided ? Math.max(1, limit as number) : 0;
  const skip = isPaginationProvided ? (pageNumber - 1) * pageSize : 0;

  const [totalCount, results] = await Promise.all([
    query.model.countDocuments(filterObj),
    query
      .find(filterObj)
      .sort({ [sort.field!]: sort.order === "desc" ? -1 : 1, _id: -1 })
      .skip(skip)
      .limit(isPaginationProvided ? pageSize : 0)
      .lean()
      .exec(),
  ]);

  const formattedResults = results.map((r) => formatResultData<any>(r));

  const totalPages = isPaginationProvided
    ? Math.ceil(totalCount / pageSize)
    : 1;

  return {
    pagination: { page: pageNumber, limit: pageSize, totalCount, totalPages },
    results: formattedResults,
  };
};
