import type { TarotCardDefinition, TarotSuit } from "../types/tarot";

export type TarotCardCategory = "大阿尔卡那" | TarotSuit;

export const TAROT_CARD_CATEGORIES: TarotCardCategory[] = [
  "大阿尔卡那",
  "权杖",
  "圣杯",
  "宝剑",
  "星币",
];

export function belongsToTarotCardCategory(
  card: TarotCardDefinition,
  category: TarotCardCategory,
): boolean {
  return category === "大阿尔卡那"
    ? card.arcana === "大阿尔卡那"
    : card.suit === category;
}
