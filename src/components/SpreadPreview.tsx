import type { CSSProperties } from "react";
import { TAROT_CARDS } from "../data/tarotCards";
import type { DemoSelections } from "../types/demo";
import type {
  SpreadTemplate,
  TemplateSpreadSnapshot,
} from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";

interface SpreadPreviewProps {
  template: SpreadTemplate | TemplateSpreadSnapshot;
  activePositionId?: string | null;
  selections: DemoSelections;
  personalMeaningCardIds?: ReadonlySet<string>;
  readOnly?: boolean;
  onPositionSelect?: (positionId: string) => void;
  onOpenPersonalMeaning: (cardId: string) => void;
}

interface SpreadLayout {
  tier: "large" | "medium-large" | "medium" | "small" | "compact";
  desktopCardWidth: number;
  mobileCardWidth: number;
}

function getSpreadLayout(positionCount: number): SpreadLayout {
  if (positionCount <= 1) {
    return { tier: "large", desktopCardWidth: 180, mobileCardWidth: 128 };
  }

  if (positionCount <= 3) {
    return {
      tier: "medium-large",
      desktopCardWidth: 140,
      mobileCardWidth: 88,
    };
  }

  if (positionCount <= 6) {
    return { tier: "medium", desktopCardWidth: 112, mobileCardWidth: 76 };
  }

  if (positionCount <= 10) {
    return { tier: "small", desktopCardWidth: 92, mobileCardWidth: 64 };
  }

  return { tier: "compact", desktopCardWidth: 74, mobileCardWidth: 54 };
}

function getCanvasHeight(
  cardWidth: number,
  ySpan: number,
  readOnly: boolean,
): number {
  const cardHeight = Math.round((cardWidth * 527) / 300);
  const contentAllowance = readOnly ? 80 : 72;
  const layoutAllowance = Math.round(ySpan * (readOnly ? 1.8 : 2.1));

  return cardHeight + contentAllowance + layoutAllowance;
}

/** 按模板中的相对坐标展示固定牌位，牌位文字不会随牌面旋转。 */
export function SpreadPreview({
  template,
  activePositionId,
  selections,
  readOnly = false,
  onPositionSelect = () => undefined,
  onOpenPersonalMeaning,
}: SpreadPreviewProps) {
  const layout = getSpreadLayout(template.positions.length);
  const yValues = template.positions.map((position) => position.y);
  const ySpan =
    yValues.length > 0 ? Math.max(...yValues) - Math.min(...yValues) : 0;
  const spreadStyle = {
    "--spread-card-width": `${layout.desktopCardWidth}px`,
    "--spread-card-width-mobile": `${layout.mobileCardWidth}px`,
    "--spread-canvas-height": `${getCanvasHeight(
      layout.desktopCardWidth,
      ySpan,
      readOnly,
    )}px`,
    "--spread-canvas-height-mobile": `${getCanvasHeight(
      layout.mobileCardWidth,
      ySpan,
      readOnly,
    )}px`,
  } as CSSProperties;

  return (
    <article
      className={`spread-preview spread-preview--${layout.tier}${
        readOnly ? " is-read-only" : ""
      }`}
      style={spreadStyle}
    >
      {!readOnly && (
        <>
          <header className="spread-preview__header">
            <div>
              <p className="section-kicker">固定牌阵</p>
              <h3>{template.templateName}</h3>
            </div>
            <span>{template.positions.length} 张牌</span>
          </header>

          <p className="spread-preview__description">
            {template.templateDescription}
          </p>
        </>
      )}

      <div
        className="spread-canvas"
        aria-label={`${template.templateName}牌阵预览`}
      >
        {template.positions.map((position) => {
          const selection = selections[position.positionId];
          const card = selection?.cardId
            ? TAROT_CARDS.find(
                (candidate) => candidate.cardId === selection.cardId,
              )
            : undefined;
          const orientation = selection?.orientation ?? null;
          const isActive = position.positionId === activePositionId;
          const displayRotation =
            position.rotation +
            (position.displayOrientation === "landscape" ? 90 : 0);
          const positionActionLabel =
            card && orientation
              ? `编辑“${position.positionName}”的牌：${card.nameZh}，${orientation}${
                  isActive ? "，当前牌位" : ""
                }`
              : `为“${position.positionName}”选择牌${
                  isActive ? "，当前牌位" : ""
                }`;

          return (
            <div
              className={`spread-position${isActive ? " is-active" : ""}`}
              data-position-id={position.positionId}
              key={position.positionId}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              {readOnly ? (
                <div className="spread-position__read-only">
                  {card ? (
                    <button
                      className="spread-position__card-action"
                      type="button"
                      aria-label={`查看${card.nameZh}的个人牌意`}
                      onClick={() => onOpenPersonalMeaning(card.cardId)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onOpenPersonalMeaning(card.cardId);
                        }
                      }}
                    >
                      <div
                        className="spread-position__card"
                        style={{ transform: `rotate(${displayRotation}deg)` }}
                      >
                        <TarotCardFace
                          card={card}
                          orientation={orientation}
                          size="compact"
                        />
                      </div>
                    </button>
                  ) : (
                    <div
                      className="spread-position__card"
                      style={{ transform: `rotate(${displayRotation}deg)` }}
                    >
                      <div
                        className="empty-card-slot"
                        aria-label="牌面资料不可用"
                      >
                        <span aria-hidden="true">✦</span>
                        <small>牌面资料不可用</small>
                      </div>
                    </div>
                  )}

                  <span className="spread-position__label spread-position__label--read-only">
                    <strong>{position.positionName}</strong>
                  </span>
                </div>
              ) : (
                <>
                  <button
                    className="spread-position__select"
                    type="button"
                    aria-current={isActive ? "true" : undefined}
                    aria-label={positionActionLabel}
                    onClick={() => onPositionSelect(position.positionId)}
                  >
                    <div
                      className="spread-position__card"
                      style={{ transform: `rotate(${displayRotation}deg)` }}
                    >
                      {card ? (
                        <TarotCardFace
                          card={card}
                          orientation={orientation}
                          size="compact"
                        />
                      ) : (
                        <div
                          className="empty-card-slot"
                          aria-label="尚未选择塔罗牌"
                        >
                          <span aria-hidden="true">✦</span>
                          <small>点击选择这张牌</small>
                        </div>
                      )}
                    </div>

                    <span className="spread-position__label">
                      <strong>{position.positionName}</strong>
                    </span>
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
