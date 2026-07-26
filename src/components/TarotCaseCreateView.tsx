import { useState } from "react";
import { SPREAD_TEMPLATES } from "../data/spreadTemplates";
import type {
  DemoPositionSelection,
  DemoSelections,
} from "../types/demo";
import type { TarotCase } from "../types/tarot";
import { createTarotCase } from "../utils/createTarotCase";
import { SpreadPreview } from "./SpreadPreview";
import {
  TarotCaseForm,
  type TarotCaseFormSubmitResult,
  type TarotCaseFormValues,
} from "./TarotCaseForm";
import { TarotCardPickerModal } from "./TarotCardPickerModal";

const DEFAULT_TEMPLATE =
  SPREAD_TEMPLATES.find(
    (template) => template.templateId === "timeline-three-card",
  ) ?? SPREAD_TEMPLATES[0];

function createEmptySelections(templateId: string): DemoSelections {
  const template =
    SPREAD_TEMPLATES.find((candidate) => candidate.templateId === templateId) ??
    DEFAULT_TEMPLATE;

  return Object.fromEntries(
    template.positions.map((position) => [
      position.positionId,
      { cardId: null, orientation: null },
    ]),
  );
}

interface TarotCaseCreateViewProps {
  personalMeaningCardIds: ReadonlySet<string>;
  onCreate: (tarotCase: TarotCase) => TarotCaseFormSubmitResult;
  onOpenPersonalMeaning: (cardId: string) => void;
}

export function TarotCaseCreateView({
  personalMeaningCardIds,
  onCreate,
  onOpenPersonalMeaning,
}: TarotCaseCreateViewProps) {
  const [activeTemplateId, setActiveTemplateId] = useState(
    DEFAULT_TEMPLATE.templateId,
  );
  const [activePositionId, setActivePositionId] = useState(
    DEFAULT_TEMPLATE.positions[0].positionId,
  );
  const [selections, setSelections] = useState<DemoSelections>(() =>
    createEmptySelections(DEFAULT_TEMPLATE.templateId),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [caseDraftVersion, setCaseDraftVersion] = useState(0);
  const [workflowMessage, setWorkflowMessage] = useState(
    "点击牌阵中的卡牌位置开始选牌。",
  );

  const activeTemplate =
    SPREAD_TEMPLATES.find(
      (template) => template.templateId === activeTemplateId,
    ) ?? DEFAULT_TEMPLATE;
  const activePosition =
    activeTemplate.positions.find(
      (position) => position.positionId === activePositionId,
    ) ?? activeTemplate.positions[0];
  const activeSelection = selections[activePosition.positionId] ?? {
    cardId: null,
    orientation: null,
  };
  const completedPositionCount = activeTemplate.positions.filter((position) => {
    const selection = selections[position.positionId];

    return selection?.cardId && selection.orientation;
  }).length;
  const allPositionsComplete =
    completedPositionCount === activeTemplate.positions.length;

  function handleTemplateChange(templateId: string): void {
    if (templateId === activeTemplateId) {
      return;
    }

    const hasSelectedCards = Object.values(selections).some(
      (selection) => selection.cardId !== null,
    );

    if (
      hasSelectedCards &&
      !window.confirm(
        "切换牌阵会清空当前已经选择的牌。确定要继续切换吗？",
      )
    ) {
      return;
    }

    const nextTemplate =
      SPREAD_TEMPLATES.find(
        (template) => template.templateId === templateId,
      ) ?? DEFAULT_TEMPLATE;

    setActiveTemplateId(nextTemplate.templateId);
    setActivePositionId(nextTemplate.positions[0].positionId);
    setSelections(createEmptySelections(nextTemplate.templateId));
    setIsPickerOpen(false);
    setCaseDraftVersion((version) => version + 1);
    setWorkflowMessage(
      `已切换到「${nextTemplate.templateName}」，点击牌位开始选牌。`,
    );
  }

  function handlePositionConfirm(
    confirmedSelection: DemoPositionSelection,
  ): void {
    const completedPosition = activePosition;
    const nextSelections = {
      ...selections,
      [completedPosition.positionId]: confirmedSelection,
    };
    const positionsByOrder = [...activeTemplate.positions].sort(
      (first, second) => first.order - second.order,
    );
    const completedPositionIndex = positionsByOrder.findIndex(
      (position) => position.positionId === completedPosition.positionId,
    );
    const followingPositions = [
      ...positionsByOrder.slice(completedPositionIndex + 1),
      ...positionsByOrder.slice(0, completedPositionIndex),
    ];
    const nextIncompletePosition = followingPositions.find((position) => {
      const selection = nextSelections[position.positionId];

      return !(selection?.cardId && selection.orientation);
    });

    setSelections(nextSelections);
    setIsPickerOpen(false);

    if (nextIncompletePosition) {
      setActivePositionId(nextIncompletePosition.positionId);
      setWorkflowMessage(
        `「${completedPosition.positionName}」已完成，接下来请选择「${nextIncompletePosition.positionName}」。`,
      );
      return;
    }

    setActivePositionId(completedPosition.positionId);
    setWorkflowMessage("所有牌位已完成，可以填写并保存案例。");
  }

  function handleCaseSave(
    values: TarotCaseFormValues,
  ): TarotCaseFormSubmitResult {
    try {
      return onCreate(
        createTarotCase({
          ...values,
          template: activeTemplate,
          selections,
        }),
      );
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "案例保存失败，请稍后重试。",
      };
    }
  }

  return (
    <div className="create-case-view">
      <div className="view-heading">
        <div>
          <p className="section-kicker">新建案例</p>
          <h2>记录一次塔罗解读</h2>
          <p>先完成牌阵中的每个牌位，再填写问题和综合解读。</p>
        </div>
      </div>

      <section
        className="demo-section workflow-demo"
        aria-labelledby="spread-title"
      >
        <div className="section-heading">
          <div>
            <p className="section-kicker">步骤 1</p>
            <h2 id="spread-title">选择牌阵并完成选牌</h2>
          </div>
          <p>点击牌位选择牌，点击“个人牌意”记录长期笔记。</p>
        </div>

        <div className="spread-template-switcher" aria-label="选择内置牌阵">
          {SPREAD_TEMPLATES.map((template) => (
            <button
              className={
                template.templateId === activeTemplateId ? "is-active" : ""
              }
              key={template.templateId}
              type="button"
              aria-pressed={template.templateId === activeTemplateId}
              onClick={() => handleTemplateChange(template.templateId)}
            >
              <strong>{template.templateName}</strong>
              <span>{template.positions.length} 张牌</span>
            </button>
          ))}
        </div>

        <SpreadPreview
          activePositionId={activePosition.positionId}
          selections={selections}
          personalMeaningCardIds={personalMeaningCardIds}
          template={activeTemplate}
          onPositionSelect={(positionId) => {
            setActivePositionId(positionId);
            setIsPickerOpen(true);
          }}
          onOpenPersonalMeaning={onOpenPersonalMeaning}
        />

        <div className="spread-workflow-status">
          <div>
            <span>当前进度</span>
            <strong>
              {completedPositionCount} / {activeTemplate.positions.length}
            </strong>
          </div>
          <p role="status">{workflowMessage}</p>
        </div>
      </section>

      {allPositionsComplete ? (
        <TarotCaseForm
          key={`${activeTemplate.templateId}-${caseDraftVersion}`}
          completedPositionCount={completedPositionCount}
          templateName={activeTemplate.templateName}
          totalPositionCount={activeTemplate.positions.length}
          onSave={handleCaseSave}
        />
      ) : (
        <section className="case-form-locked" aria-label="案例内容尚未开放">
          <span aria-hidden="true">✦</span>
          <div>
            <strong>完成所有牌位后填写案例内容</strong>
            <p>
              还需完成{" "}
              {activeTemplate.positions.length - completedPositionCount}{" "}
              个牌位。
            </p>
          </div>
        </section>
      )}

      {isPickerOpen && (
        <TarotCardPickerModal
          key={activePosition.positionId}
          initialSelection={activeSelection}
          personalMeaningCardIds={personalMeaningCardIds}
          position={activePosition}
          onClose={() => setIsPickerOpen(false)}
          onConfirm={handlePositionConfirm}
          onOpenPersonalMeaning={onOpenPersonalMeaning}
        />
      )}
    </div>
  );
}
