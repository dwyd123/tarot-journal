import type { CaseCategory, CaseStatus, TarotCase } from "../types/tarot";

export type CaseSortOption =
  | "recent-reading"
  | "earliest-reading"
  | "recent-updated"
  | "earliest-created";

export interface CaseListQuery {
  search: string;
  status: CaseStatus | "全部";
  category: CaseCategory | "全部";
  sort: CaseSortOption;
}

function compareByReadingDate(
  first: TarotCase,
  second: TarotCase,
  direction: "asc" | "desc",
): number {
  const dateOrder = first.readingDate.localeCompare(second.readingDate);
  const createdOrder = first.createdAt.localeCompare(second.createdAt);
  const order = dateOrder || createdOrder;

  return direction === "asc" ? order : -order;
}

export function getVisibleTarotCases(
  cases: TarotCase[],
  query: CaseListQuery,
): TarotCase[] {
  const searchText = query.search.trim().toLocaleLowerCase("zh-CN");
  const visibleCases = cases.filter((tarotCase) => {
    const matchesSearch =
      !searchText ||
      [
        tarotCase.question,
        tarotCase.querentCode ?? "",
        tarotCase.spreadSnapshot.templateName,
      ].some((value) =>
        value.toLocaleLowerCase("zh-CN").includes(searchText),
      );
    const matchesStatus =
      query.status === "全部" || tarotCase.status === query.status;
    const matchesCategory =
      query.category === "全部" || tarotCase.category === query.category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return [...visibleCases].sort((first, second) => {
    switch (query.sort) {
      case "earliest-reading":
        return compareByReadingDate(first, second, "asc");
      case "recent-updated":
        return second.updatedAt.localeCompare(first.updatedAt);
      case "earliest-created":
        return first.createdAt.localeCompare(second.createdAt);
      case "recent-reading":
      default:
        return compareByReadingDate(first, second, "desc");
    }
  });
}
