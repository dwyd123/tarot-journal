import { useState } from "react";
import { TAROT_CARDS } from "../data/tarotCards";
import type { TarotCardDefinition, TarotSuit } from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";

type PickerCategory = "大阿尔卡那" | TarotSuit;

interface TarotCardPickerProps {
  selectedCardId: string | null;
  onSelect: (cardId: string) => void;
}

const PICKER_CATEGORIES: PickerCategory[] = [
  "大阿尔卡那",
  "权杖",
  "圣杯",
  "宝剑",
  "星币",
];

function belongsToCategory(
  card: TarotCardDefinition,
  category: PickerCategory,
): boolean {
  if (category === "大阿尔卡那") {
    return card.arcana === "大阿尔卡那";
  }

  return card.suit === category;
}

/** 从标准78张牌中点击选择，并只返回现有牌的cardId。 */
export function TarotCardPicker({
  selectedCardId,
  onSelect,
}: TarotCardPickerProps) {
  const [activeCategory, setActiveCategory] =
    useState<PickerCategory>("大阿尔卡那");

  const visibleCards = TAROT_CARDS.filter((card) =>
    belongsToCategory(card, activeCategory),
  );
  const panelId = "tarot-card-picker-panel";

  return (
    <section className="tarot-card-picker" aria-label="选择一张塔罗牌">
      <div
        className="card-category-tabs"
        role="tablist"
        aria-label="塔罗牌分类"
      >
        {PICKER_CATEGORIES.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              className={`category-tab${isActive ? " is-active" : ""}`}
              id={`category-${category}`}
              key={category}
              type="button"
              role="tab"
              aria-controls={panelId}
              aria-selected={isActive}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div
        className="card-option-grid"
        id={panelId}
        role="tabpanel"
        aria-label={`${activeCategory}牌库`}
      >
        {visibleCards.map((card) => {
          const isSelected = card.cardId === selectedCardId;

          return (
            <button
              className={`card-option${isSelected ? " is-selected" : ""}`}
              key={card.cardId}
              type="button"
              aria-label={`${card.nameZh}，${card.nameEn}${isSelected ? "，已选择" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(card.cardId)}
            >
              <div className="card-option__face" aria-hidden="true">
                <TarotCardFace
                  card={card}
                  orientation={null}
                  size="compact"
                  imageLoading="lazy"
                />
              </div>
              <span className="card-option__name-zh">{card.nameZh}</span>
              <span className="card-option__name-en">{card.nameEn}</span>
              {isSelected && (
                <span className="card-option__selected">
                  <span aria-hidden="true">✓</span>
                  <span className="sr-only">已选择</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
