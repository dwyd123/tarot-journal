import type { TarotSuit } from "../types/tarot";
import { SPREAD_TEMPLATES } from "./spreadTemplates";
import { TAROT_CARDS } from "./tarotCards";

export interface DataIntegritySummary {
  cardCount: number;
  imagePathCount: number;
  majorArcanaCount: number;
  suitCounts: Record<TarotSuit, number>;
  templateCount: number;
  justiceCardId: string;
  strengthCardId: string;
}

function assertNoDuplicates(values: string[], label: string): void {
  const duplicates = values.filter(
    (value, index) => values.indexOf(value) !== index,
  );

  if (duplicates.length > 0) {
    throw new Error(`${label}存在重复值：${[...new Set(duplicates)].join("、")}`);
  }
}

/** 发现数量或编号异常时直接抛出错误，让检查命令失败。 */
export function validateDataIntegrity(): DataIntegritySummary {
  if (TAROT_CARDS.length !== 78) {
    throw new Error(`塔罗牌总数应为78张，当前为${TAROT_CARDS.length}张。`);
  }

  const incompleteCards = TAROT_CARDS.filter(
    (card) =>
      !card.cardId ||
      !card.nameZh ||
      !card.nameEn ||
      !card.arcana ||
      !card.displayNumber,
  );

  if (incompleteCards.length > 0) {
    throw new Error("存在基础字段不完整的塔罗牌资料。");
  }

  const cardsWithoutImages = TAROT_CARDS.filter((card) => !card.imagePath);

  if (cardsWithoutImages.length > 0) {
    throw new Error(
      `存在未设置imagePath的塔罗牌：${cardsWithoutImages
        .map((card) => card.cardId)
        .join("、")}`,
    );
  }

  assertNoDuplicates(
    TAROT_CARDS.map((card) => card.cardId),
    "cardId",
  );

  const imagePaths = TAROT_CARDS.map((card) => card.imagePath as string);

  assertNoDuplicates(imagePaths, "imagePath");

  const cardsWithUnexpectedImagePaths = TAROT_CARDS.filter(
    (card) =>
      card.imagePath !== `/tarot/rider-waite/${card.cardId}.jpg`,
  );

  if (cardsWithUnexpectedImagePaths.length > 0) {
    throw new Error(
      `牌面路径与cardId不一致：${cardsWithUnexpectedImagePaths
        .map((card) => card.cardId)
        .join("、")}`,
    );
  }

  const majorArcanaCount = TAROT_CARDS.filter(
    (card) => card.arcana === "大阿尔卡那",
  ).length;

  if (majorArcanaCount !== 22) {
    throw new Error(`大阿尔卡那应为22张，当前为${majorArcanaCount}张。`);
  }

  const numberedMajorIds = TAROT_CARDS.filter(
    (card) =>
      card.arcana === "大阿尔卡那" && /^major-\d+$/.test(card.cardId),
  );

  if (numberedMajorIds.length > 0) {
    throw new Error("大阿尔卡那的cardId不能使用依赖牌序的纯数字形式。");
  }

  const justiceCard = TAROT_CARDS.find((card) => card.nameEn === "Justice");
  const strengthCard = TAROT_CARDS.find((card) => card.nameEn === "Strength");

  if (justiceCard?.cardId !== "major-justice") {
    throw new Error("正义必须使用语义化cardId：major-justice。");
  }

  if (strengthCard?.cardId !== "major-strength") {
    throw new Error("力量必须使用语义化cardId：major-strength。");
  }

  const suits: TarotSuit[] = ["权杖", "圣杯", "宝剑", "星币"];
  const suitCounts = Object.fromEntries(
    suits.map((suit) => [
      suit,
      TAROT_CARDS.filter((card) => card.suit === suit).length,
    ]),
  ) as Record<TarotSuit, number>;

  for (const suit of suits) {
    if (suitCounts[suit] !== 14) {
      throw new Error(`${suit}应为14张，当前为${suitCounts[suit]}张。`);
    }
  }

  assertNoDuplicates(
    SPREAD_TEMPLATES.map((template) => template.templateId),
    "templateId",
  );

  for (const template of SPREAD_TEMPLATES) {
    assertNoDuplicates(
      template.positions.map((position) => position.positionId),
      `牌阵“${template.templateName}”的positionId`,
    );
  }

  return {
    cardCount: TAROT_CARDS.length,
    imagePathCount: imagePaths.length,
    majorArcanaCount,
    suitCounts,
    templateCount: SPREAD_TEMPLATES.length,
    justiceCardId: justiceCard.cardId,
    strengthCardId: strengthCard.cardId,
  };
}
