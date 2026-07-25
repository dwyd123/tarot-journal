import { useEffect, useState } from "react";
import { TAROT_CARDS } from "../data/tarotCards";
import type { DemoPositionSelection } from "../types/demo";
import type {
  CardOrientation,
  SpreadTemplatePosition,
} from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";
import { TarotCardPicker } from "./TarotCardPicker";

interface TarotCardPickerModalProps {
  position: SpreadTemplatePosition;
  initialSelection: DemoPositionSelection;
  onClose: () => void;
  onComplete: (selection: DemoPositionSelection) => void;
}

/** 在独立弹层中完成一个牌位的选牌和正逆位选择。 */
export function TarotCardPickerModal({
  position,
  initialSelection,
  onClose,
  onComplete,
}: TarotCardPickerModalProps) {
  const [draft, setDraft] =
    useState<DemoPositionSelection>(initialSelection);
  const selectedCard = draft.cardId
    ? TAROT_CARDS.find((card) => card.cardId === draft.cardId)
    : undefined;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleCardSelect(cardId: string): void {
    setDraft({ cardId, orientation: null });
  }

  function handleOrientationSelect(orientation: CardOrientation): void {
    setDraft((current) => ({ ...current, orientation }));
  }

  function handleComplete(): void {
    if (!draft.cardId || !draft.orientation) {
      return;
    }

    onComplete({
      cardId: draft.cardId,
      orientation: draft.orientation,
    });
  }

  return (
    <div className="picker-modal-backdrop">
      <section
        className="picker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-modal-title"
      >
        <header className="picker-modal__header">
          <div>
            <p className="section-kicker">选择牌</p>
            <h2 id="picker-modal-title">
              为「{position.positionName}」选择一张牌
            </h2>
            <p>{position.positionMeaning}</p>
          </div>
          <button
            className="picker-modal__close"
            type="button"
            aria-label="关闭选牌"
            autoFocus
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="picker-modal__workspace">
          <div
            className={`picker-modal__selection${
              selectedCard ? " has-selection" : ""
            }`}
          >
            {selectedCard ? (
              <>
                <div className="picker-modal__selected-face">
                  <TarotCardFace
                    card={selectedCard}
                    orientation={draft.orientation}
                  />
                </div>
                <div className="picker-modal__selected-copy">
                  <span>当前选择</span>
                  <strong>{selectedCard.nameZh}</strong>
                  <small>{selectedCard.nameEn}</small>
                </div>
                <div className="picker-modal__direction">
                  <span role="status">
                    {draft.orientation ?? "请选择正位或逆位"}
                  </span>
                  <div className="picker-modal__direction-actions">
                    <div
                      className="segmented-control"
                      aria-label={`为${selectedCard.nameZh}选择正逆位`}
                    >
                      {(["正位", "逆位"] as CardOrientation[]).map((value) => (
                        <button
                          className={
                            draft.orientation === value ? "is-active" : ""
                          }
                          key={value}
                          type="button"
                          aria-pressed={draft.orientation === value}
                          onClick={() => handleOrientationSelect(value)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    <button
                      className="picker-modal__complete"
                      type="button"
                      disabled={!draft.orientation}
                      onClick={handleComplete}
                    >
                      完成选牌
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p role="status">请先选择一张牌</p>
            )}
          </div>

          <TarotCardPicker
            selectedCardId={draft.cardId}
            onSelect={handleCardSelect}
          />
        </div>
      </section>
    </div>
  );
}
