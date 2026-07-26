import type {
  CardOrientation,
  CaseCategory,
  CasePosition,
  CaseStatus,
  DisplayOrientation,
  TarotCase,
} from "../types/tarot";
import { calculateCaseStatus } from "../utils/calculateCaseStatus";

export const TAROT_CASE_STORAGE_KEY = "tarot-journal:cases:v1";

export interface TarotCaseLoadResult {
  cases: TarotCase[];
  invalidCount: number;
}

interface StoredValuesResult {
  values: unknown[];
  unreadable: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function optionalStoredText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function readStoredValues(): StoredValuesResult {
  try {
    const storedValue = window.localStorage.getItem(TAROT_CASE_STORAGE_KEY);

    if (!storedValue) {
      return { values: [], unreadable: false };
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    return Array.isArray(parsedValue)
      ? { values: parsedValue, unreadable: false }
      : { values: [], unreadable: true };
  } catch {
    return { values: [], unreadable: true };
  }
}

function writeStoredValues(values: unknown[]): void {
  try {
    window.localStorage.setItem(
      TAROT_CASE_STORAGE_KEY,
      JSON.stringify(values),
    );
  } catch {
    throw new Error(
      "案例保存失败。请检查浏览器是否允许本地存储，或存储空间是否已满。",
    );
  }
}

/** 将旧版本或未知的分类转换成当前支持的值。 */
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

function normalizeOrientation(value: unknown): CardOrientation | undefined {
  return value === "正位" || value === "逆位" ? value : undefined;
}

function normalizeDisplayOrientation(value: unknown): DisplayOrientation {
  return value === "landscape" ? "landscape" : "portrait";
}

function normalizeCasePosition(value: unknown): CasePosition | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const orientation = normalizeOrientation(value.orientation);

  if (
    typeof value.positionId !== "string" ||
    typeof value.order !== "number" ||
    typeof value.positionName !== "string" ||
    typeof value.cardId !== "string" ||
    !orientation
  ) {
    return undefined;
  }

  return {
    positionId: value.positionId,
    order: value.order,
    positionName: value.positionName,
    positionMeaning:
      typeof value.positionMeaning === "string" ? value.positionMeaning : "",
    x: typeof value.x === "number" ? value.x : 50,
    y: typeof value.y === "number" ? value.y : 50,
    displayOrientation: normalizeDisplayOrientation(
      value.displayOrientation,
    ),
    rotation: typeof value.rotation === "number" ? value.rotation : 0,
    cardId: value.cardId,
    cardNameSnapshot:
      typeof value.cardNameSnapshot === "string"
        ? value.cardNameSnapshot
        : value.cardId,
    orientation,
    firstImpression: optionalStoredText(value.firstImpression),
    interpretation: optionalStoredText(value.interpretation),
  };
}

function normalizeStoredStatus(
  value: unknown,
  followUp?: string,
  reviewNotes?: string,
): CaseStatus {
  if (value === "待反馈" || value === "已反馈" || value === "已复盘") {
    return value;
  }

  return calculateCaseStatus(followUp, reviewNotes);
}

export function normalizeStoredTarotCase(
  value: unknown,
): TarotCase | undefined {
  if (!isRecord(value) || !isRecord(value.spreadSnapshot)) {
    return undefined;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.dataVersion !== "number" ||
    typeof value.title !== "string" ||
    typeof value.readingDate !== "string" ||
    typeof value.question !== "string" ||
    typeof value.overallInterpretation !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    value.spreadMode !== "template" ||
    !Array.isArray(value.spreadSnapshot.positions)
  ) {
    return undefined;
  }

  const positions = value.spreadSnapshot.positions.map(normalizeCasePosition);

  if (positions.some((position) => !position)) {
    return undefined;
  }

  const followUp = optionalStoredText(value.followUp);
  const reviewNotes = optionalStoredText(value.reviewNotes);
  const spreadSnapshot = value.spreadSnapshot;

  return {
    id: value.id,
    dataVersion: value.dataVersion,
    title: value.title,
    readingDate: value.readingDate,
    querentCode: optionalStoredText(value.querentCode),
    category: normalizeStoredCaseCategory(value.category),
    question: value.question,
    deckName: optionalStoredText(value.deckName),
    overallInterpretation: value.overallInterpretation,
    advice: optionalStoredText(value.advice),
    followUp,
    reviewNotes,
    tags: Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === "string")
      : [],
    isFavorite:
      typeof value.isFavorite === "boolean" ? value.isFavorite : false,
    status: normalizeStoredStatus(value.status, followUp, reviewNotes),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    spreadMode: "template",
    spreadSnapshot: {
      templateId:
        typeof spreadSnapshot.templateId === "string"
          ? spreadSnapshot.templateId
          : "legacy-template",
      templateVersion:
        typeof spreadSnapshot.templateVersion === "number"
          ? spreadSnapshot.templateVersion
          : 1,
      templateName:
        typeof spreadSnapshot.templateName === "string"
          ? spreadSnapshot.templateName
          : "已保存牌阵",
      templateDescription:
        typeof spreadSnapshot.templateDescription === "string"
          ? spreadSnapshot.templateDescription
          : "",
      positions: positions as CasePosition[],
    },
  };
}

/** 返回可读取案例的同时报告异常数量，但不会改写或删除原始数据。 */
export function loadTarotCaseLibrary(): TarotCaseLoadResult {
  const stored = readStoredValues();
  const normalizedCases = stored.values.map(normalizeStoredTarotCase);
  const cases = normalizedCases.filter(
    (tarotCase): tarotCase is TarotCase => Boolean(tarotCase),
  );

  return {
    cases,
    invalidCount:
      normalizedCases.length - cases.length + (stored.unreadable ? 1 : 0),
  };
}

export function loadTarotCases(): TarotCase[] {
  return loadTarotCaseLibrary().cases;
}

/** 新案例放在存储数组最前面，无法读取的原始记录保持原样。 */
export function addTarotCase(tarotCase: TarotCase): TarotCase[] {
  const stored = readStoredValues();

  if (stored.unreadable) {
    throw new Error("本地案例数据格式异常，为避免覆盖原数据，暂时无法保存。");
  }

  writeStoredValues([tarotCase, ...stored.values]);
  return loadTarotCases();
}

/** 按原位置替换案例，保留其他记录及异常原始数据。 */
export function updateTarotCase(updatedCase: TarotCase): TarotCase[] {
  const stored = readStoredValues();

  if (stored.unreadable) {
    throw new Error("本地案例数据格式异常，为避免覆盖原数据，暂时无法更新。");
  }

  let didUpdate = false;
  const nextValues = stored.values.map((value) => {
    if (isRecord(value) && value.id === updatedCase.id) {
      didUpdate = true;
      return updatedCase;
    }

    return value;
  });

  if (!didUpdate) {
    throw new Error("没有找到需要更新的案例。");
  }

  writeStoredValues(nextValues);
  return loadTarotCases();
}

/** 根据id删除指定案例，其他记录及异常原始数据保持不变。 */
export function deleteTarotCase(caseId: string): TarotCase[] {
  const stored = readStoredValues();

  if (stored.unreadable) {
    throw new Error("本地案例数据格式异常，为避免覆盖原数据，暂时无法删除。");
  }

  writeStoredValues(
    stored.values.filter(
      (value) => !(isRecord(value) && value.id === caseId),
    ),
  );
  return loadTarotCases();
}

export function getTarotCaseById(caseId: string): TarotCase | undefined {
  return loadTarotCases().find((tarotCase) => tarotCase.id === caseId);
}
