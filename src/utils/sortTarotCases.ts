import type { TarotCase } from "../types/tarot";

/** 先按占卜日期、再按创建时间从新到旧排列。 */
export function sortTarotCases(cases: TarotCase[]): TarotCase[] {
  return [...cases].sort((first, second) => {
    const readingDateOrder = second.readingDate.localeCompare(
      first.readingDate,
    );

    return readingDateOrder || second.createdAt.localeCompare(first.createdAt);
  });
}
