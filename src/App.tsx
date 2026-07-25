import { useState } from "react";
import { SpreadPreview } from "./components/SpreadPreview";
import { TarotCardPickerModal } from "./components/TarotCardPickerModal";
import { SPREAD_TEMPLATES } from "./data/spreadTemplates";
import { TAROT_CARDS } from "./data/tarotCards";
import type {
  DemoPositionSelection,
  DemoSelections,
} from "./types/demo";

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

function App() {
  const [activeTemplateId, setActiveTemplateId] = useState<string>(
    DEFAULT_TEMPLATE.templateId,
  );
  const [activePositionId, setActivePositionId] = useState<string>(
    DEFAULT_TEMPLATE.positions[0].positionId,
  );
  const [selections, setSelections] = useState<DemoSelections>(() =>
    createEmptySelections(DEFAULT_TEMPLATE.templateId),
  );
  const [isPickerOpen, setIsPickerOpen] = useState(false);
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

  function handleTemplateChange(templateId: string): void {
    if (templateId === activeTemplateId) {
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
    setWorkflowMessage(
      `已切换到「${nextTemplate.templateName}」，点击牌位开始选牌。`,
    );
  }

  function handlePositionSelect(positionId: string): void {
    setActivePositionId(positionId);
    setIsPickerOpen(true);
  }

  function handlePickerClose(): void {
    setIsPickerOpen(false);
  }

  function handlePositionComplete(
    completedSelection: DemoPositionSelection,
  ): void {
    const completedPosition = activePosition;
    const nextSelections = {
      ...selections,
      [completedPosition.positionId]: completedSelection,
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
    setWorkflowMessage("所有牌位已完成。");
  }

  return (
    <main className="app-shell">
      <header className="intro-card" aria-labelledby="app-title">
        <div className="intro-card__copy">
          <div className="brand-mark" aria-hidden="true">
            ✦
          </div>
          <div>
            <p className="eyebrow">Tarot Journal · Stage 3</p>
            <h1 id="app-title">塔罗组件演示</h1>
            <p className="description">
              先选择固定牌阵和具体牌位，再为每个位置分别记录牌与正逆位。
            </p>
          </div>
        </div>

        <div className="data-summary" aria-label="基础数据状态">
          <p>
            <strong>{TAROT_CARDS.length}</strong>
            <span>张标准牌</span>
          </p>
          <p>
            <strong>{SPREAD_TEMPLATES.length}</strong>
            <span>个内置牌阵</span>
          </p>
          <div className="status" role="status">
            <span className="status-dot" aria-hidden="true" />
            第三阶段演示
          </div>
        </div>
      </header>

      <div className="content-shell">
        <section
          className="demo-section workflow-demo"
          aria-labelledby="spread-title"
        >
          <div className="section-heading">
            <div>
              <p className="section-kicker">步骤 1</p>
              <h2 id="spread-title">选择牌阵</h2>
            </div>
            <p>切换牌阵会清空当前演示选择，并从新牌阵的第一个牌位开始。</p>
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
            onPositionSelect={handlePositionSelect}
            selections={selections}
            template={activeTemplate}
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

        {isPickerOpen && (
          <TarotCardPickerModal
            key={activePosition.positionId}
            initialSelection={activeSelection}
            position={activePosition}
            onClose={handlePickerClose}
            onComplete={handlePositionComplete}
          />
        )}

        <footer className="scope-note">
          <span aria-hidden="true">✦</span>
          <p>
            当前仅演示选牌、文字牌面和固定牌阵，不会保存任何案例数据。
          </p>
        </footer>
      </div>
    </main>
  );
}

export default App;
