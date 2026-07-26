import type { TarotCardDefinition } from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";

interface TarotDeckCardProps {
  card: TarotCardDefinition;
  hasPersonalMeaning: boolean;
  onOpen: (cardId: string) => void;
}

export function TarotDeckCard({
  card,
  hasPersonalMeaning,
  onOpen,
}: TarotDeckCardProps) {
  return (
    <article className="tarot-deck-card">
      <button
        className="tarot-deck-card__open"
        type="button"
        aria-label={`查看并编辑${card.nameZh}的个人牌意`}
        onClick={() => onOpen(card.cardId)}
      >
        <div className="tarot-deck-card__face" aria-hidden="true">
          <TarotCardFace
            card={card}
            orientation={null}
            imageLoading="lazy"
          />
        </div>
        <strong>{card.nameZh}</strong>
        <span>{card.nameEn}</span>
        <small className={hasPersonalMeaning ? "is-recorded" : ""}>
          <span aria-hidden="true">{hasPersonalMeaning ? "✓" : "○"}</span>
          {hasPersonalMeaning ? "已记录" : "未记录"}
        </small>
      </button>
    </article>
  );
}
