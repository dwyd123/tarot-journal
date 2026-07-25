import { TAROT_CARDS } from "../data/tarotCards";
import type { DemoSelections } from "../types/demo";
import type { SpreadTemplate } from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";

interface SpreadPreviewProps {
  template: SpreadTemplate;
  activePositionId: string;
  selections: DemoSelections;
  onPositionSelect: (positionId: string) => void;
}

/** 按模板中的相对坐标展示固定牌位，牌位文字不会随牌面旋转。 */
export function SpreadPreview({
  template,
  activePositionId,
  selections,
  onPositionSelect,
}: SpreadPreviewProps) {
  return (
    <article className="spread-preview">
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
          const completionLabel = !card
            ? "未选择牌"
            : orientation === null
              ? "请选择正逆位"
              : "已完成";
          const displayRotation =
            position.rotation +
            (position.displayOrientation === "landscape" ? 90 : 0);

          return (
            <button
              className={`spread-position${isActive ? " is-active" : ""}`}
              data-position-id={position.positionId}
              key={position.positionId}
              type="button"
              aria-label={`为${position.positionName}选择牌`}
              aria-pressed={isActive}
              onClick={() => onPositionSelect(position.positionId)}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
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
                  <div className="empty-card-slot" aria-label="尚未选择塔罗牌">
                    <span aria-hidden="true">✦</span>
                    <small>点击选择这张牌</small>
                  </div>
                )}
              </div>

              {isActive && (
                <span className="spread-position__active-mark">正在选择</span>
              )}

              <span
                className={`spread-position__state${
                  card && orientation ? " is-complete" : ""
                }`}
              >
                {completionLabel}
              </span>

              <div className="spread-position__label">
                <strong>{position.positionName}</strong>
                <span>{position.positionMeaning}</span>
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}
