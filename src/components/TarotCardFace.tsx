import { useState } from "react";
import type {
  CardOrientation,
  TarotCardDefinition,
} from "../types/tarot";

interface TarotCardFaceProps {
  card: TarotCardDefinition;
  orientation?: CardOrientation | null;
  size?: "standard" | "compact";
  imageLoading?: "eager" | "lazy";
}

/** 真实图片为空时显示统一的文字占位牌面。 */
export function TarotCardFace({
  card,
  orientation = null,
  size = "standard",
  imageLoading = "eager",
}: TarotCardFaceProps) {
  const [failedImagePath, setFailedImagePath] = useState<string | null>(null);
  const isReversed = orientation === "逆位";
  const cardGroup = card.suit ?? "大阿尔卡那";
  const shouldShowImage =
    card.imagePath !== null && failedImagePath !== card.imagePath;

  return (
    <div
      className={`tarot-card-face tarot-card-face--${size}${
        shouldShowImage ? " has-image" : ""
      }`}
      aria-label={`${card.nameZh}，${orientation ?? "未选择正逆位"}`}
    >
      <div
        className={`tarot-card-face__content${
          shouldShowImage ? " has-image" : ""
        }${isReversed ? " is-reversed" : ""}`}
      >
        {shouldShowImage ? (
          <img
            className="tarot-card-face__image"
            src={card.imagePath ?? undefined}
            alt={`${card.nameZh}牌面`}
            decoding="async"
            loading={imageLoading}
            onError={() => setFailedImagePath(card.imagePath)}
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
