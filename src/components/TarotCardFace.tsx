import type {
  CardOrientation,
  TarotCardDefinition,
} from "../types/tarot";

interface TarotCardFaceProps {
  card: TarotCardDefinition;
  orientation?: CardOrientation | null;
  size?: "standard" | "compact";
}

/** 真实图片为空时显示统一的文字占位牌面。 */
export function TarotCardFace({
  card,
  orientation = null,
  size = "standard",
}: TarotCardFaceProps) {
  const isReversed = orientation === "逆位";
  const cardGroup = card.suit ?? "大阿尔卡那";

  return (
    <div
      className={`tarot-card-face tarot-card-face--${size}`}
      aria-label={`${card.nameZh}，${orientation ?? "未选择正逆位"}`}
    >
      <div
        className={`tarot-card-face__content${isReversed ? " is-reversed" : ""}`}
      >
        {card.imagePath ? (
          <img
            className="tarot-card-face__image"
            src={card.imagePath}
            alt={card.nameZh}
          />
        ) : (
          <>
            <span className="tarot-card-face__number">
              {card.displayNumber}
            </span>
            <span className="tarot-card-face__ornament" aria-hidden="true">
              ✦
            </span>
            <span className="tarot-card-face__name-zh">{card.nameZh}</span>
            <span className="tarot-card-face__name-en">{card.nameEn}</span>
            <span className="tarot-card-face__group">{cardGroup}</span>
          </>
        )}
      </div>
    </div>
  );
}
