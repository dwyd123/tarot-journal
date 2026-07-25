import type { PersonalCardMeaning } from "../types/personalCardMeaning";

export const PERSONAL_CARD_MEANING_STORAGE_KEY =
  "tarot-journal:personal-card-meanings:v1";

/** 从新旧版本数据中只取当前仍然使用的三个牌意字段。 */
export function normalizeStoredPersonalCardMeaning(
  value: unknown,
): PersonalCardMeaning | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const meaning = value as Record<string, unknown>;

  if (
    typeof meaning.cardId === "string" &&
    typeof meaning.uprightMeaning === "string" &&
    typeof meaning.reversedMeaning === "string" &&
    typeof meaning.personalAssociations === "string" &&
    typeof meaning.createdAt === "string" &&
    typeof meaning.updatedAt === "string"
  ) {
    return {
      cardId: meaning.cardId,
      uprightMeaning: meaning.uprightMeaning,
      reversedMeaning: meaning.reversedMeaning,
      personalAssociations: meaning.personalAssociations,
      createdAt: meaning.createdAt,
      updatedAt: meaning.updatedAt,
    };
  }

  return undefined;
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
