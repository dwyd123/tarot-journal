import type { CaseCategory, TarotCase } from "../types/tarot";

export const TAROT_CASE_STORAGE_KEY = "tarot-journal:cases:v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasStoredTarotCaseShape(
  value: unknown,
): value is Record<string, unknown> {
  if (!isRecord(value) || !isRecord(value.spreadSnapshot)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.dataVersion === "number" &&
    typeof value.title === "string" &&
    typeof value.readingDate === "string" &&
    typeof value.question === "string" &&
    typeof value.overallInterpretation === "string" &&
    value.spreadMode === "template" &&
    Array.isArray(value.spreadSnapshot.positions) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

/** 将旧版本或未知的分类转换成第一版当前支持的值。 */
export function normalizeStoredCaseCategory(
  value: unknown,
): CaseCategory | undefined {
  switch (value) {
    case "感情":
    case "事业":
    case "财务":
    case "学业":
    case "人际关系":
    case "今日运势":
    case "其他":
      return value;
    case "工作":
      return "事业";
    case "人际":
      return "人际关系";
    case "每日指引":
      return "今日运势";
    case "自我探索":
    case "寻物":
      return "其他";
    default:
      return undefined;
  }
}

function parseStoredTarotCase(value: unknown): TarotCase | undefined {
  if (!hasStoredTarotCaseShape(value)) {
    return undefined;
  }

  return {
    ...(value as unknown as TarotCase),
    category: normalizeStoredCaseCategory(value.category),
  };
}

/** 读取失败或旧数据损坏时返回空数组，避免页面崩溃。 */
export function loadTarotCases(): TarotCase[] {
  try {
    const storedValue = window.localStorage.getItem(TAROT_CASE_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(parseStoredTarotCase)
      .filter((tarotCase): tarotCase is TarotCase =>
        Boolean(tarotCase),
      );
  } catch {
    return [];
  }
}

export function saveTarotCases(cases: TarotCase[]): void {
  try {
    window.localStorage.setItem(TAROT_CASE_STORAGE_KEY, JSON.stringify(cases));
  } catch {
    throw new Error(
      "案例保存失败。请检查浏览器是否允许本地存储，或存储空间是否已满。",
    );
  }
}

/** 新案例放在最前面，方便读取最近保存的一条。 */
export function addTarotCase(tarotCase: TarotCase): TarotCase[] {
  const nextCases = [tarotCase, ...loadTarotCases()];

  saveTarotCases(nextCases);
  return nextCases;
}

export function getTarotCaseById(caseId: string): TarotCase | undefined {
  return loadTarotCases().find((tarotCase) => tarotCase.id === caseId);
}
