import { useState } from "react";
import { PersonalCardMeaningModal } from "./components/PersonalCardMeaningModal";
import { SpreadPreview } from "./components/SpreadPreview";
import {
  TarotCaseForm,
  type TarotCaseFormSubmitResult,
  type TarotCaseFormValues,
} from "./components/TarotCaseForm";
import { TarotCardPickerModal } from "./components/TarotCardPickerModal";
import { SPREAD_TEMPLATES } from "./data/spreadTemplates";
import { TAROT_CARDS } from "./data/tarotCards";
import {
  loadPersonalCardMeanings,
} from "./storage/personalCardMeaningStorage";
import {
  addTarotCase,
  loadTarotCases,
} from "./storage/tarotCaseStorage";
import type {
  DemoPositionSelection,
  DemoSelections,
} from "./types/demo";
import type { PersonalCardMeaning } from "./types/personalCardMeaning";
import type { TarotCase } from "./types/tarot";
import { createTarotCase } from "./utils/createTarotCase";

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

function getTemplateSummary(tarotCase: TarotCase): {
  templateName: string;
  cardCount: number;
} {
  return {
    templateName: tarotCase.spreadSnapshot.templateName,
    cardCount: tarotCase.spreadSnapshot.positions.length,
  };
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
  const [personalMeaningCardId, setPersonalMeaningCardId] = useState<
    string | null
  >(null);
  const [personalMeaningCardIds, setPersonalMeaningCardIds] = useState<
    Set<string>
  >(
    () =>
      new Set(
        loadPersonalCardMeanings().map((meaning) => meaning.cardId),
      ),
  );
  const [savedCases, setSavedCases] =
    useState<TarotCase[]>(loadTarotCases);
  const [currentSavedCaseId, setCurrentSavedCaseId] = useState<string | null>(
    null,
  );
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
  const currentSavedCase = currentSavedCaseId
    ? savedCases.find((tarotCase) => tarotCase.id === currentSavedCaseId)
    : undefined;
  const latestStoredCase = savedCases[0];
  const personalMeaningCard = personalMeaningCardId
    ? TAROT_CARDS.find((card) => card.cardId === personalMeaningCardId)
    : undefined;

  function handleTemplateChange(templateId: string): void {
    if (templateId === activeTemplateId || currentSavedCase) {
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

  function handlePositionSelect(positionId: string): void {
    if (currentSavedCase) {
      return;
    }

    setActivePositionId(positionId);
    setIsPickerOpen(true);
  }

  function handlePickerClose(): void {
    setIsPickerOpen(false);
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
      const tarotCase = createTarotCase({
        ...values,
        template: activeTemplate,
        selections,
      });
      const nextCases = addTarotCase(tarotCase);

      setSavedCases(nextCases);
      setCurrentSavedCaseId(tarotCase.id);
      setWorkflowMessage("案例已保存到当前浏览器。");
      return { success: true };
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

  function handleNewCase(): void {
    setSelections(createEmptySelections(activeTemplate.templateId));
    setActivePositionId(activeTemplate.positions[0].positionId);
    setCurrentSavedCaseId(null);
    setIsPickerOpen(false);
    setCaseDraftVersion((version) => version + 1);
    setWorkflowMessage("新的案例已准备好，请从第一个牌位开始选牌。");
  }

  function handlePersonalMeaningSaved(
    meaning: PersonalCardMeaning,
  ): void {
    setPersonalMeaningCardIds((current) => {
      const next = new Set(current);

      next.add(meaning.cardId);
      return next;
    });
  }

  return (
    <main className="app-shell">
      <header className="intro-card" aria-labelledby="app-title">
        <div className="intro-card__copy">
          <div className="brand-mark" aria-hidden="true">
            ✦
          </div>
          <div>
            <p className="eyebrow">Tarot Journal · Local Edition</p>
            <h1 id="app-title">塔罗案例手记</h1>
            <p className="description">
              完成牌阵、记录综合解读，并建立会在不同案例中共用的个人牌意。
            </p>
          </div>
        </div>

        <div className="data-summary" aria-label="本地数据状态">
          <p>
            <strong>{savedCases.length}</strong>
            <span>条本地案例</span>
          </p>
          <p>
            <strong>{personalMeaningCardIds.size}</strong>
            <span>张个人牌意</span>
          </p>
          <div className="status" role="status">
            <span className="status-dot" aria-hidden="true" />
            仅保存在当前浏览器
          </div>
        </div>
      </header>

      <div className="content-shell">
        <section className="local-library-summary" aria-label="本地记录摘要">
          <div>
            <span>已保存</span>
            <strong>{savedCases.length} 条案例</strong>
          </div>
          {latestStoredCase ? (
            <p>
              最近保存：<strong>{latestStoredCase.title}</strong>
              <span>
                {latestStoredCase.readingDate} ·{" "}
                {getTemplateSummary(latestStoredCase).templateName} ·{" "}
                {getTemplateSummary(latestStoredCase).cardCount} 张牌
              </span>
            </p>
          ) : (
            <p>还没有保存案例，完成下方三个步骤即可建立第一条记录。</p>
          )}
        </section>

        <section
          className="demo-section workflow-demo"
          aria-labelledby="spread-title"
        >
          <div className="section-heading">
            <div>
              <p className="section-kicker">步骤 1</p>
              <h2 id="spread-title">选择牌阵并完成选牌</h2>
            </div>
            <p>
              牌阵由内置模板生成；点击牌位选择牌，点击“个人牌意”记录长期笔记。
            </p>
          </div>

          <div className="spread-template-switcher" aria-label="选择内置牌阵">
            {SPREAD_TEMPLATES.map((template) => (
              <button
                className={
                  template.templateId === activeTemplateId ? "is-active" : ""
                }
                key={template.templateId}
                type="button"
                disabled={Boolean(currentSavedCase)}
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
            readOnly={Boolean(currentSavedCase)}
            template={activeTemplate}
            onPositionSelect={handlePositionSelect}
            onOpenPersonalMeaning={setPersonalMeaningCardId}
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

        {allPositionsComplete && !currentSavedCase && (
          <TarotCaseForm
            key={`${activeTemplate.templateId}-${caseDraftVersion}`}
            completedPositionCount={completedPositionCount}
            templateName={activeTemplate.templateName}
            totalPositionCount={activeTemplate.positions.length}
            onSave={handleCaseSave}
          />
        )}

        {!allPositionsComplete && !currentSavedCase && (
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

        {currentSavedCase && (
          <section className="case-save-success" aria-live="polite">
            <span className="case-save-success__mark" aria-hidden="true">
              ✓
            </span>
            <div>
              <p className="section-kicker">案例已保存</p>
              <h2>{currentSavedCase.title}</h2>
              <p>
                {currentSavedCase.readingDate} ·{" "}
                {getTemplateSummary(currentSavedCase).templateName} ·{" "}
                {getTemplateSummary(currentSavedCase).cardCount} 张牌
              </p>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={handleNewCase}
            >
              新建另一条案例
            </button>
          </section>
        )}

        <footer className="scope-note">
          <span aria-hidden="true">✦</span>
          <p>
            本阶段只提供正式录入、本地保存与个人牌意；暂不包含案例列表和云端同步。
          </p>
        </footer>
      </div>

      {isPickerOpen && (
        <TarotCardPickerModal
          key={activePosition.positionId}
          initialSelection={activeSelection}
          personalMeaningCardIds={personalMeaningCardIds}
          position={activePosition}
          onClose={handlePickerClose}
          onConfirm={handlePositionConfirm}
          onOpenPersonalMeaning={setPersonalMeaningCardId}
        />
      )}

      {personalMeaningCard && (
        <PersonalCardMeaningModal
          key={personalMeaningCard.cardId}
          card={personalMeaningCard}
          onClose={() => setPersonalMeaningCardId(null)}
          onSaved={handlePersonalMeaningSaved}
        />
      )}
    </main>
  );
}

export default App;
