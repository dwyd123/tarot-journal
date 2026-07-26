import { useState } from "react";
import {
  belongsToTarotCardCategory,
  TAROT_CARD_CATEGORIES,
  type TarotCardCategory,
} from "../data/tarotCardCategories";
import { TAROT_CARDS } from "../data/tarotCards";
import { TarotDeckCard } from "./TarotDeckCard";

interface MyTarotDeckProps {
  personalMeaningCardIds: ReadonlySet<string>;
  onOpenPersonalMeaning: (cardId: string) => void;
}

export function MyTarotDeck({
  personalMeaningCardIds,
  onOpenPersonalMeaning,
}: MyTarotDeckProps) {
  const [activeCategory, setActiveCategory] =
    useState<TarotCardCategory>("大阿尔卡那");
  const visibleCards = TAROT_CARDS.filter((card) =>
    belongsToTarotCardCategory(card, activeCategory),
  );

  return (
    <section className="tarot-deck-view" aria-labelledby="tarot-deck-title">
      <div className="view-heading">
        <div>
          <p className="section-kicker">完整 78 张塔罗牌</p>
          <h2 id="tarot-deck-title">我的牌库</h2>
          <p>浏览完整牌库，并记录属于你自己的牌意。</p>
        </div>
        <div className="tarot-deck-summary">
          <strong>{personalMeaningCardIds.size}</strong>
          <span>张牌已有牌意</span>
        </div>
      </div>

      <div
        className="deck-category-tabs"
        role="tablist"
        aria-label="牌库分类"
      >
        {TAROT_CARD_CATEGORIES.map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              className={isActive ? "is-active" : ""}
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      <p className="tarot-deck-view__count" role="status">
        {activeCategory} · {visibleCards.length} 张
      </p>

      <div
        className="tarot-deck-grid"
        role="tabpanel"
        aria-label={`${activeCategory}牌库`}
      >
        {visibleCards.map((card) => (
          <TarotDeckCard
            card={card}
            hasPersonalMeaning={personalMeaningCardIds.has(card.cardId)}
            key={card.cardId}
            onOpen={onOpenPersonalMeaning}
          />
        ))}
      </div>
    </section>
  );
}
