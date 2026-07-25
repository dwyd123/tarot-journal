import { useEffect, useState } from "react";
import {
  getPersonalCardMeaning,
  upsertPersonalCardMeaning,
} from "../storage/personalCardMeaningStorage";
import type { PersonalCardMeaning } from "../types/personalCardMeaning";
import type { TarotCardDefinition } from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";

interface PersonalCardMeaningModalProps {
  card: TarotCardDefinition;
  onClose: () => void;
  onSaved: (meaning: PersonalCardMeaning) => void;
}

interface MeaningDraft {
  uprightMeaning: string;
  reversedMeaning: string;
  personalAssociations: string;
}

const EMPTY_DRAFT: MeaningDraft = {
  uprightMeaning: "",
  reversedMeaning: "",
  personalAssociations: "",
};

/** 编辑与案例无关、通过cardId全局复用的个人牌意。 */
export function PersonalCardMeaningModal({
  card,
  onClose,
  onSaved,
}: PersonalCardMeaningModalProps) {
  const [storedMeaning, setStoredMeaning] = useState(() =>
    getPersonalCardMeaning(card.cardId),
  );
  const [draft, setDraft] = useState<MeaningDraft>(() =>
    storedMeaning
      ? {
          uprightMeaning: storedMeaning.uprightMeaning,
          reversedMeaning: storedMeaning.reversedMeaning,
          personalAssociations: storedMeaning.personalAssociations,
        }
      : EMPTY_DRAFT,
  );
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onClose]);

  function updateField(field: keyof MeaningDraft, value: string): void {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaveMessage("");
    setSaveError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const timestamp = new Date().toISOString();
    const meaning: PersonalCardMeaning = {
      cardId: card.cardId,
      uprightMeaning: draft.uprightMeaning.trim(),
      reversedMeaning: draft.reversedMeaning.trim(),
      personalAssociations: draft.personalAssociations.trim(),
      createdAt: storedMeaning?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    try {
      const savedMeaning = upsertPersonalCardMeaning(meaning);

      setStoredMeaning(savedMeaning);
      onSaved(savedMeaning);
      setSaveError("");
      setSaveMessage(`“${card.nameZh}”的个人牌意已保存。`);
    } catch (error) {
      setSaveMessage("");
      setSaveError(
        error instanceof Error
          ? error.message
          : "个人牌意保存失败，请稍后重试。",
      );
    }
  }

  return (
    <div className="personal-meaning-backdrop">
      <section
        className="personal-meaning-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="personal-meaning-title"
      >
        <header className="personal-meaning-modal__header">
          <div>
            <p className="section-kicker">个人牌意</p>
            <h2 id="personal-meaning-title">记录「{card.nameZh}」</h2>
            <p>这份内容属于你的全局牌意库，会在不同案例中共用。</p>
          </div>
          <button
            className="picker-modal__close"
            type="button"
            aria-label="关闭个人牌意"
            autoFocus
            onClick={onClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form className="personal-meaning-form" onSubmit={handleSubmit}>
          <aside className="personal-meaning-card">
            <TarotCardFace card={card} orientation={null} />
            <strong>{card.nameZh}</strong>
            <span>{card.nameEn}</span>
          </aside>

          <div className="personal-meaning-fields">
            <label className="form-field form-field--wide">
              <span>我的正位牌意</span>
              <textarea
                rows={4}
                value={draft.uprightMeaning}
                onChange={(event) =>
                  updateField("uprightMeaning", event.currentTarget.value)
                }
                placeholder="这张牌正位时，我通常怎样理解？"
              />
            </label>

            <label className="form-field form-field--wide">
              <span>我的逆位牌意</span>
              <textarea
                rows={4}
                value={draft.reversedMeaning}
                onChange={(event) =>
                  updateField("reversedMeaning", event.currentTarget.value)
                }
                placeholder="这张牌逆位时，我观察到哪些变化？"
              />
            </label>

            <label className="form-field form-field--wide">
              <span>个人联想与案例经验</span>
              <textarea
                rows={4}
                value={draft.personalAssociations}
                onChange={(event) =>
                  updateField(
                    "personalAssociations",
                    event.currentTarget.value,
                  )
                }
                placeholder="记录个人经验、重复出现的规律或特别联想"
              />
            </label>

            {(saveMessage || saveError) && (
              <p
                className={`form-message${saveError ? " is-error" : " is-success"}`}
                role={saveError ? "alert" : "status"}
              >
                {saveError || saveMessage}
              </p>
            )}

            <div className="personal-meaning-form__actions">
              <button
                className="secondary-action"
                type="button"
                onClick={onClose}
              >
                关闭
              </button>
              <button className="primary-action" type="submit">
                保存个人牌意
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
