import { useState } from "react";
import type { DemoSelections } from "../types/demo";
import type { TarotCase } from "../types/tarot";
import { createUpdatedTarotCase } from "../utils/updateTarotCase";
import {
  OptionalCaseFields,
  type OptionalCaseValues,
} from "./OptionalCaseFields";
import { SpreadPreview } from "./SpreadPreview";
import type { TarotCaseFormSubmitResult } from "./TarotCaseForm";
import { TarotCardPickerModal } from "./TarotCardPickerModal";

interface TarotCaseEditorProps {
  tarotCase: TarotCase;
  personalMeaningCardIds: ReadonlySet<string>;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  onOpenPersonalMeaning: (cardId: string) => void;
  onSave: (tarotCase: TarotCase) => TarotCaseFormSubmitResult;
}

function createSelections(tarotCase: TarotCase): DemoSelections {
  return Object.fromEntries(
    tarotCase.spreadSnapshot.positions.map((position) => [
      position.positionId,
      {
        cardId: position.cardId,
        orientation: position.orientation,
      },
    ]),
  );
}

export function TarotCaseEditor({
  tarotCase,
  personalMeaningCardIds,
  onCancel,
  onDirtyChange,
  onOpenPersonalMeaning,
  onSave,
}: TarotCaseEditorProps) {
  const [readingDate, setReadingDate] = useState(tarotCase.readingDate);
  const [question, setQuestion] = useState(tarotCase.question);
  const [overallInterpretation, setOverallInterpretation] = useState(
    tarotCase.overallInterpretation,
  );
  const [optionalValues, setOptionalValues] = useState<OptionalCaseValues>({
    querentCode: tarotCase.querentCode ?? "",
    category: tarotCase.category ?? "",
    advice: tarotCase.advice ?? "",
    followUp: tarotCase.followUp ?? "",
    reviewNotes: tarotCase.reviewNotes ?? "",
  });
  const [selections, setSelections] = useState<DemoSelections>(() =>
    createSelections(tarotCase),
  );
  const [activePositionId, setActivePositionId] = useState(
    tarotCase.spreadSnapshot.positions[0]?.positionId ?? "",
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formError, setFormError] = useState("");
  const [editorMessage, setEditorMessage] = useState(
    "点击任意牌位可以修改牌和正逆位。",
  );

  if (
    tarotCase.spreadMode !== "template" ||
    tarotCase.spreadSnapshot.positions.length === 0
  ) {
    return (
      <section className="case-not-found">
        <h2>当前版本暂不支持编辑这条案例</h2>
        <button className="secondary-action" type="button" onClick={onCancel}>
          返回案例详情
        </button>
      </section>
    );
  }

  const activePosition =
    tarotCase.spreadSnapshot.positions.find(
      (position) => position.positionId === activePositionId,
    ) ?? tarotCase.spreadSnapshot.positions[0];
  const activeSelection = selections[activePosition.positionId] ?? {
    cardId: null,
    orientation: null,
  };

  function markChanged(): void {
    setIsDirty(true);
    onDirtyChange(true);
    setFormError("");
  }

  function handleCancel(): void {
    if (
      isDirty &&
      !window.confirm("确定放弃本次修改吗？")
    ) {
      return;
    }

    onCancel();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    try {
      const result = onSave(
        createUpdatedTarotCase(tarotCase, {
          readingDate,
          question,
          overallInterpretation,
          querentCode: optionalValues.querentCode,
          category: optionalValues.category || undefined,
          advice: optionalValues.advice,
          followUp: optionalValues.followUp,
          reviewNotes: optionalValues.reviewNotes,
          selections,
        }),
      );

      if (!result.success) {
        setFormError(result.error ?? "案例更新失败，请稍后重试。");
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "案例更新失败，请稍后重试。",
      );
    }
  }

  return (
    <section className="case-editor-view" aria-labelledby="case-editor-title">
      <button className="back-action" type="button" onClick={handleCancel}>
        <span aria-hidden="true">←</span> 返回案例详情
      </button>

      <div className="view-heading">
        <div>
          <p className="section-kicker">编辑案例</p>
          <h2 id="case-editor-title">{tarotCase.title}</h2>
          <p>已保存的案例暂不支持更换牌阵。</p>
        </div>
      </div>

      <SpreadPreview
        activePositionId={activePosition.positionId}
        selections={selections}
        personalMeaningCardIds={personalMeaningCardIds}
        template={tarotCase.spreadSnapshot}
        onPositionSelect={(positionId) => {
          setActivePositionId(positionId);
          setIsPickerOpen(true);
        }}
        onOpenPersonalMeaning={onOpenPersonalMeaning}
      />

      <p className="view-message" role="status">
        {editorMessage}
      </p>

      <form className="case-form case-editor-form" noValidate onSubmit={handleSubmit}>
        <div className="case-auto-info">
          <label className="form-field">
            <span>
              占卜日期 <b aria-hidden="true">*</b>
            </span>
            <input
              type="date"
              value={readingDate}
              onChange={(event) => {
                setReadingDate(event.currentTarget.value);
                markChanged();
              }}
            />
          </label>
          <div>
            <span>当前牌阵</span>
            <strong>{tarotCase.spreadSnapshot.templateName}</strong>
          </div>
        </div>

        <label className="form-field form-field--wide">
          <span>
            具体问题 <b aria-hidden="true">*</b>
          </span>
          <textarea
            rows={3}
            value={question}
            onChange={(event) => {
              setQuestion(event.currentTarget.value);
              markChanged();
            }}
          />
        </label>

        <label className="form-field form-field--wide">
          <span>
            综合解读 <b aria-hidden="true">*</b>
          </span>
          <textarea
            rows={6}
            value={overallInterpretation}
            onChange={(event) => {
              setOverallInterpretation(event.currentTarget.value);
              markChanged();
            }}
          />
        </label>

        <OptionalCaseFields
          defaultOpen
          values={optionalValues}
          onChange={(values) => {
            setOptionalValues(values);
            markChanged();
          }}
        />

        {formError && (
          <p className="form-message is-error" role="alert">
            {formError}
          </p>
        )}

        <div className="case-form__actions">
          <button
            className="secondary-action"
            type="button"
            onClick={handleCancel}
          >
            取消
          </button>
          <button className="primary-action" type="submit">
            保存修改
          </button>
        </div>
      </form>

      {isPickerOpen && (
        <TarotCardPickerModal
          key={activePosition.positionId}
          initialSelection={activeSelection}
          personalMeaningCardIds={personalMeaningCardIds}
          position={activePosition}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={(selection) => {
            setSelections((current) => ({
              ...current,
              [activePosition.positionId]: selection,
            }));
            setIsPickerOpen(false);
            setIsDirty(true);
            onDirtyChange(true);
            setEditorMessage(
              `“${activePosition.positionName}”的牌面已更新，保存修改后才会写入案例。`,
            );
          }}
          onOpenPersonalMeaning={onOpenPersonalMeaning}
        />
      )}
    </section>
  );
}
