import type {
  PersonalCardMeaning,
  PersonalMeaningEntry,
} from "../types/personalCardMeaning";

export const PERSONAL_CARD_MEANING_STORAGE_KEY =
  "tarot-journal:personal-card-meanings:v1";

function normalizeEntry(value: unknown): PersonalMeaningEntry | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const entry = value as Record<string, unknown>;

  if (
    typeof entry.id === "string" &&
    typeof entry.label === "string" &&
    typeof entry.content === "string" &&
    entry.label.trim()
  ) {
    return {
      id: entry.id,
      label: entry.label.trim(),
      content: entry.content,
    };
  }

  return undefined;
}

function normalizeEntries(value: unknown): PersonalMeaningEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(normalizeEntry)
    .filter((entry): entry is PersonalMeaningEntry => Boolean(entry));
}

/** 兼容旧版 uprightMeaning / reversedMeaning，并统一为当前结构。 */
export function normalizeStoredPersonalCardMeaning(
  value: unknown,
): PersonalCardMeaning | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const meaning = value as Record<string, unknown>;

  if (
    typeof meaning.cardId === "string" &&
    typeof meaning.personalAssociations === "string" &&
    typeof meaning.createdAt === "string" &&
    typeof meaning.updatedAt === "string"
  ) {
    const hasNewSummaryFields =
      typeof meaning.uprightSummary === "string" &&
      typeof meaning.reversedSummary === "string";
    const hasLegacyMeaningFields =
      typeof meaning.uprightMeaning === "string" &&
      typeof meaning.reversedMeaning === "string";

    if (!hasNewSummaryFields && !hasLegacyMeaningFields) {
      return undefined;
    }

    return {
      cardId: meaning.cardId,
      uprightSummary: hasNewSummaryFields
        ? (meaning.uprightSummary as string)
        : (meaning.uprightMeaning as string),
      uprightEntries: hasNewSummaryFields
        ? normalizeEntries(meaning.uprightEntries)
        : [],
      reversedSummary: hasNewSummaryFields
        ? (meaning.reversedSummary as string)
        : (meaning.reversedMeaning as string),
      reversedEntries: hasNewSummaryFields
        ? normalizeEntries(meaning.reversedEntries)
        : [],
      personalAssociations: meaning.personalAssociations,
      createdAt: meaning.createdAt,
      updatedAt: meaning.updatedAt,
    };
  }

  return undefined;
}

/** 牌库中的“已记录”只取真正含有内容的字段。 */
export function hasPersonalCardMeaningContent(
  meaning: PersonalCardMeaning,
): boolean {
  return Boolean(
    meaning.uprightSummary.trim() ||
      meaning.uprightEntries.some((entry) => entry.content.trim()) ||
      meaning.reversedSummary.trim() ||
      meaning.reversedEntries.some((entry) => entry.content.trim()) ||
      meaning.personalAssociations.trim(),
  );
}

/** 读取失败或内容损坏时返回空数组。 */
export function loadPersonalCardMeanings(): PersonalCardMeaning[] {
  try {
    const storedValue = window.localStorage.getItem(
      PERSONAL_CARD_MEANING_STORAGE_KEY,
    );

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeStoredPersonalCardMeaning)
      .filter((meaning): meaning is PersonalCardMeaning => Boolean(meaning));
  } catch {
    return [];
  }
}

function savePersonalCardMeanings(meanings: PersonalCardMeaning[]): void {
  try {
    window.localStorage.setItem(
      PERSONAL_CARD_MEANING_STORAGE_KEY,
      JSON.stringify(meanings),
    );
  } catch {
    throw new Error(
      "个人牌意保存失败。请检查浏览器是否允许本地存储，或存储空间是否已满。",
    );
  }
}

export function getPersonalCardMeaning(
  cardId: string,
): PersonalCardMeaning | undefined {
  return loadPersonalCardMeanings().find(
    (meaning) => meaning.cardId === cardId,
  );
}

/** 同一个cardId只保留一条记录。 */
export function upsertPersonalCardMeaning(
  meaning: PersonalCardMeaning,
): PersonalCardMeaning {
  const otherMeanings = loadPersonalCardMeanings().filter(
    (candidate) => candidate.cardId !== meaning.cardId,
  );

  savePersonalCardMeanings([meaning, ...otherMeanings]);
  return meaning;
}

export function deletePersonalCardMeaning(cardId: string): void {
  const remainingMeanings = loadPersonalCardMeanings().filter(
    (meaning) => meaning.cardId !== cardId,
  );

  savePersonalCardMeanings(remainingMeanings);
}
