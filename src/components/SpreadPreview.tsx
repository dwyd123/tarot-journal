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

const EMPTY_PERSONAL_MEANING_CARD_IDS = new Set<string>();

/** 按模板中的相对坐标展示固定牌位，牌位文字不会随牌面旋转。 */
export function SpreadPreview({
  template,
  activePositionId,
  selections,
  personalMeaningCardIds = EMPTY_PERSONAL_MEANING_CARD_IDS,
  readOnly = false,
  onPositionSelect = () => undefined,
  onOpenPersonalMeaning,
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
          const hasPersonalMeaning = card
            ? personalMeaningCardIds.has(card.cardId)
            : false;

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

                  <span className="spread-position__label">
                    <strong>{position.positionName}</strong>
                    <span>{position.positionMeaning}</span>
                  </span>
                </div>
              ) : (
                <>
                  <button
                    className="spread-position__select"
                    type="button"
                    aria-label={`为${position.positionName}选择牌`}
                    aria-pressed={isActive}
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

                    {isActive && (
                      <span className="spread-position__active-mark">
                        正在选择
                      </span>
                    )}

                    <span
                      className={`spread-position__state${
                        card && orientation ? " is-complete" : ""
                      }`}
                    >
                      {completionLabel}
                    </span>

                    <span className="spread-position__label">
                      <strong>{position.positionName}</strong>
                      <span>{position.positionMeaning}</span>
                    </span>
                  </button>

                  {card && (
                    <button
                      className="spread-position__meaning"
                      type="button"
                      aria-label={`编辑${card.nameZh}的个人牌意`}
                      onClick={() => onOpenPersonalMeaning(card.cardId)}
                    >
                      {hasPersonalMeaning
                        ? "个人牌意 · 已有笔记"
                        : "个人牌意"}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}
