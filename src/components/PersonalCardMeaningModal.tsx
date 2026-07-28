import { useCallback, useEffect, useState } from "react";
import {
  getPersonalCardMeaning,
  upsertPersonalCardMeaning,
} from "../storage/personalCardMeaningStorage";
import type {
  PersonalCardMeaning,
  PersonalMeaningEntry,
} from "../types/personalCardMeaning";
import type { TarotCardDefinition } from "../types/tarot";
import { TarotCardFace } from "./TarotCardFace";

interface PersonalCardMeaningModalProps {
  card: TarotCardDefinition;
  onClose: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaved: (meaning: PersonalCardMeaning) => void;
}

type MeaningMode = "view" | "edit";
type MeaningDirection = "upright" | "reversed";
type MeaningEditTab = MeaningDirection | "experience";
type ViewOrientation = "正位" | "逆位";

const TOPIC_OPTIONS = [
  "感情",
  "事业",
  "财务",
  "个人成长",
  "建议",
  "自定义",
] as const;

interface MeaningDraft {
  uprightSummary: string;
  uprightEntries: PersonalMeaningEntry[];
  reversedSummary: string;
  reversedEntries: PersonalMeaningEntry[];
  personalAssociations: string;
}

interface EntryComposer {
  direction: MeaningDirection;
  selectedLabel: (typeof TOPIC_OPTIONS)[number];
  customLabel: string;
  content: string;
  error: string;
}

function createMeaningDraft(
  meaning?: PersonalCardMeaning,
): MeaningDraft {
  return {
    uprightSummary: meaning?.uprightSummary ?? "",
    uprightEntries: meaning?.uprightEntries.map((entry) => ({ ...entry })) ?? [],
    reversedSummary: meaning?.reversedSummary ?? "",
    reversedEntries:
      meaning?.reversedEntries.map((entry) => ({ ...entry })) ?? [],
    personalAssociations: meaning?.personalAssociations ?? "",
  };
}

function createEntryComposer(direction: MeaningDirection): EntryComposer {
  return {
    direction,
    selectedLabel: "感情",
    customLabel: "",
    content: "",
    error: "",
  };
}

interface DirectionEditorProps {
  direction: MeaningDirection;
  summary: string;
  entries: PersonalMeaningEntry[];
  onSummaryChange: (value: string) => void;
  onEntryChange: (entryId: string, content: string) => void;
  onDeleteEntry: (entry: PersonalMeaningEntry) => void;
  onStartAdding: () => void;
}

function DirectionEditor({
  direction,
  summary,
  entries,
  onSummaryChange,
  onEntryChange,
  onDeleteEntry,
  onStartAdding,
}: DirectionEditorProps) {
  const directionName = direction === "upright" ? "正位" : "逆位";

  return (
    <div className="meaning-direction-editor">
      <label className="form-field form-field--wide">
        <span>{directionName}核心理解</span>
        <textarea
          rows={4}
          value={summary}
          onChange={(event) => onSummaryChange(event.currentTarget.value)}
          placeholder={`记录这张牌${directionName}时最核心、最通用的理解。`}
        />
      </label>

      {entries.length > 0 && (
        <section className="meaning-entry-editor" aria-label={`${directionName}已有主题条目`}>
          <h3>已有主题条目</h3>
          <div className="meaning-entry-editor__list">
            {entries.map((entry) => (
              <article className="meaning-entry-editor__card" key={entry.id}>
                <header>
                  <strong>{entry.label}</strong>
                  <button
                    type="button"
                    aria-label={`删除${entry.label}主题`}
                    onClick={() => onDeleteEntry(entry)}
                  >
                    删除条目
                  </button>
                </header>
                <label className="form-field form-field--wide">
                  <span className="sr-only">{entry.label}主题内容</span>
                  <textarea
                    rows={3}
                    aria-label={`${entry.label}主题内容`}
                    value={entry.content}
                    onChange={(event) =>
                      onEntryChange(entry.id, event.currentTarget.value)
                    }
                  />
                </label>
              </article>
            ))}
          </div>
        </section>
      )}

      <button
        className="secondary-action meaning-add-entry"
        type="button"
        onClick={onStartAdding}
      >
        ＋ 添加主题牌意
      </button>
    </div>
  );
}

interface MeaningEntryModalProps {
  composer: EntryComposer;
  onChange: (composer: EntryComposer) => void;
  onCancel: () => void;
  onAdd: () => void;
}

function MeaningEntryModal({
  composer,
  onChange,
  onCancel,
  onAdd,
}: MeaningEntryModalProps) {
  const directionName =
    composer.direction === "upright" ? "正位" : "逆位";
  const finalLabel =
    composer.selectedLabel === "自定义"
      ? composer.customLabel.trim()
      : composer.selectedLabel;
  const canAdd = Boolean(finalLabel && composer.content.trim());

  return (
    <div className="meaning-entry-modal-backdrop">
      <section
        className="meaning-entry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="meaning-entry-modal-title"
      >
        <header className="meaning-entry-modal__header">
          <div>
            <h3 id="meaning-entry-modal-title">添加主题牌意</h3>
            <p>为{directionName}牌意添加一个独立主题。</p>
          </div>
          <button
            className="picker-modal__close"
            type="button"
            aria-label="关闭添加主题牌意"
            onClick={onCancel}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="meaning-entry-modal__body">
          <fieldset className="meaning-entry-topic-picker">
            <legend>选择主题</legend>
            <div className="meaning-entry-topic-options">
              {TOPIC_OPTIONS.map((label) => (
                <button
                  className={
                    composer.selectedLabel === label ? "is-active" : ""
                  }
                  key={label}
                  type="button"
                  aria-pressed={composer.selectedLabel === label}
                  onClick={() =>
                    onChange({
                      ...composer,
                      selectedLabel: label,
                      error: "",
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {composer.selectedLabel === "自定义" && (
            <label className="form-field form-field--wide">
              <span>自定义主题名称</span>
              <input
                autoFocus
                value={composer.customLabel}
                onChange={(event) =>
                  onChange({
                    ...composer,
                    customLabel: event.currentTarget.value,
                    error: "",
                  })
                }
                placeholder="例如：对方想法"
              />
            </label>
          )}

          <label className="form-field form-field--wide">
            <span>主题内容</span>
            <textarea
              rows={6}
              value={composer.content}
              onChange={(event) =>
                onChange({
                  ...composer,
                  content: event.currentTarget.value,
                  error: "",
                })
              }
              placeholder={`记录这张牌在“${finalLabel || "自定义主题"}”中的${directionName}理解。`}
            />
          </label>

          {composer.error && (
            <p className="form-message is-error" role="alert">
              {composer.error}
            </p>
          )}
        </div>

        <footer className="meaning-entry-modal__actions">
          <button
            className="secondary-action"
            type="button"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            className="primary-action"
            type="button"
            disabled={!canAdd}
            onClick={onAdd}
          >
            添加
          </button>
        </footer>
      </section>
    </div>
  );
}

/** 查看和编辑通过cardId全局复用的个人牌意。 */
export function PersonalCardMeaningModal({
  card,
  onClose,
  onDirtyChange,
  onSaved,
}: PersonalCardMeaningModalProps) {
  const [storedMeaning, setStoredMeaning] = useState(() =>
    getPersonalCardMeaning(card.cardId),
  );
  const [mode, setMode] = useState<MeaningMode>("view");
  const [viewOrientation, setViewOrientation] =
    useState<ViewOrientation>("正位");
  const [expandedEntries, setExpandedEntries] = useState<
    Record<string, boolean>
  >({});
  const [editTab, setEditTab] = useState<MeaningEditTab>("upright");
  const [draft, setDraft] = useState<MeaningDraft>(() =>
    createMeaningDraft(storedMeaning),
  );
  const [composer, setComposer] = useState<EntryComposer | null>(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const storedDraft = createMeaningDraft(storedMeaning);
  const hasUnsavedChanges =
    mode === "edit" &&
    JSON.stringify(draft) !== JSON.stringify(storedDraft);

  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  const requestClose = useCallback(() => {
    if (composer) {
      setComposer(null);
      return;
    }

    if (
      hasUnsavedChanges &&
      !window.confirm("尚有未保存的修改，确定关闭吗？")
    ) {
      return;
    }

    onClose();
  }, [composer, hasUnsavedChanges, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        requestClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [requestClose]);

  const isUprightView = viewOrientation === "正位";
  const viewSummary = isUprightView
    ? storedMeaning?.uprightSummary
    : storedMeaning?.reversedSummary;
  const viewEntries = isUprightView
    ? storedMeaning?.uprightEntries ?? []
    : storedMeaning?.reversedEntries ?? [];

  function updateDraft(patch: Partial<MeaningDraft>): void {
    setDraft((current) => ({ ...current, ...patch }));
    setSaveMessage("");
    setSaveError("");
  }

  function updateEntries(
    direction: MeaningDirection,
    updater: (entries: PersonalMeaningEntry[]) => PersonalMeaningEntry[],
  ): void {
    const key =
      direction === "upright" ? "uprightEntries" : "reversedEntries";
    updateDraft({ [key]: updater(draft[key]) });
  }

  function startEditing(): void {
    setDraft(createMeaningDraft(storedMeaning));
    setEditTab("upright");
    setComposer(null);
    setSaveMessage("");
    setSaveError("");
    setMode("edit");
  }

  function cancelEditing(): void {
    setDraft(createMeaningDraft(storedMeaning));
    setComposer(null);
    setSaveError("");
    setMode("view");
  }

  function addEntry(): void {
    if (!composer) {
      return;
    }

    const direction = composer.direction;
    const label =
      composer.selectedLabel === "自定义"
        ? composer.customLabel.trim()
        : composer.selectedLabel;
    const content = composer.content.trim();
    const entries =
      direction === "upright" ? draft.uprightEntries : draft.reversedEntries;

    if (!label || !content) {
      setComposer({
        ...composer,
        error: "请填写主题名称和主题内容。",
      });
      return;
    }

    if (entries.some((entry) => entry.label === label)) {
      setComposer({
        ...composer,
        error: "该主题已经存在，可以直接编辑原有内容。",
      });
      return;
    }

    updateEntries(direction, (current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        label,
        content,
      },
    ]);
    setComposer(null);
  }

  function deleteEntry(
    direction: MeaningDirection,
    entry: PersonalMeaningEntry,
  ): void {
    if (!window.confirm(`确定删除“${entry.label}”主题吗？`)) {
      return;
    }

    updateEntries(direction, (entries) =>
      entries.filter((candidate) => candidate.id !== entry.id),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const timestamp = new Date().toISOString();
    const meaning: PersonalCardMeaning = {
      cardId: card.cardId,
      uprightSummary: draft.uprightSummary.trim(),
      uprightEntries: draft.uprightEntries.map((entry) => ({
        ...entry,
        label: entry.label.trim(),
        content: entry.content.trim(),
      })),
      reversedSummary: draft.reversedSummary.trim(),
      reversedEntries: draft.reversedEntries.map((entry) => ({
        ...entry,
        label: entry.label.trim(),
        content: entry.content.trim(),
      })),
      personalAssociations: draft.personalAssociations.trim(),
      createdAt: storedMeaning?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    try {
      const savedMeaning = upsertPersonalCardMeaning(meaning);
      setStoredMeaning(savedMeaning);
      setDraft(createMeaningDraft(savedMeaning));
      setMode("view");
      setViewOrientation("正位");
      setExpandedEntries({});
      setComposer(null);
      onSaved(savedMeaning);
      setSaveError("");
      setSaveMessage("牌意已保存。");
    } catch (error) {
      setSaveMessage("");
      setSaveError(
        error instanceof Error
          ? error.message
          : "个人牌意保存失败，请稍后重试。",
      );
    }
  }

  const activeDirection: MeaningDirection =
    editTab === "reversed" ? "reversed" : "upright";

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
            <h2 id="personal-meaning-title">
              {mode === "view"
                ? `「${card.nameZh}」的个人牌意`
                : `编辑「${card.nameZh}」牌意`}
            </h2>
            <p>
              {mode === "view"
                ? "阅读核心理解、主题牌意和个人经验。"
                : "分别整理正位、逆位和个人经验，最后一次保存。"}
            </p>
          </div>
          <button
            className="picker-modal__close"
            type="button"
            aria-label="关闭个人牌意"
            autoFocus
            onClick={requestClose}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div className="personal-meaning-body">
          <aside className="personal-meaning-card">
            <TarotCardFace card={card} orientation={null} />
            <strong>{card.nameZh}</strong>
            <span>{card.nameEn}</span>
          </aside>

          {mode === "view" ? (
            <div className="personal-meaning-reading">
              {saveMessage && (
                <p className="form-message is-success" role="status">
                  {saveMessage}
                </p>
              )}

              <div
                className="meaning-mode-tabs"
                role="tablist"
                aria-label="查看正位或逆位牌意"
              >
                {(["正位", "逆位"] as const).map((orientation) => (
                  <button
                    className={
                      viewOrientation === orientation ? "is-active" : ""
                    }
                    key={orientation}
                    type="button"
                    role="tab"
                    aria-selected={viewOrientation === orientation}
                    onClick={() => setViewOrientation(orientation)}
                  >
                    {orientation}
                  </button>
                ))}
              </div>

              <section className="personal-meaning-reading__section is-summary">
                <h3>{viewOrientation}核心理解</h3>
                <p className={viewSummary ? "" : "is-empty"}>
                  {viewSummary || "尚未记录核心理解"}
                </p>
              </section>

              {viewEntries.length > 0 && (
                <div className="meaning-topic-cards">
                  {viewEntries.map((entry) => {
                    const expandedKey = `${viewOrientation}:${entry.id}`;
                    const isExpanded = expandedEntries[expandedKey] !== false;

                    return (
                      <article
                        className={`meaning-topic-card${isExpanded ? "" : " is-collapsed"}`}
                        key={entry.id}
                      >
                        <header>
                          <h3>{entry.label}</h3>
                          <button
                            className="meaning-topic-card__toggle"
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? "收起" : "展开"}${entry.label}牌意`}
                            onClick={() =>
                              setExpandedEntries((current) => ({
                                ...current,
                                [expandedKey]: !isExpanded,
                              }))
                            }
                          >
                            <span aria-hidden="true">▾</span>
                          </button>
                        </header>
                        {isExpanded && (
                          <p>{entry.content || "尚未记录"}</p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}

              <section className="personal-meaning-reading__section">
                <h3>个人联想与案例经验</h3>
                <p
                  className={
                    storedMeaning?.personalAssociations ? "" : "is-empty"
                  }
                >
                  {storedMeaning?.personalAssociations ||
                    "尚未记录个人经验"}
                </p>
              </section>
            </div>
          ) : (
            <form
              id="personal-meaning-edit-form"
              className="personal-meaning-fields"
              onSubmit={handleSubmit}
            >
              <div
                className="meaning-edit-tabs"
                role="tablist"
                aria-label="个人牌意编辑分类"
              >
                {[
                  ["upright", "编辑正位"],
                  ["reversed", "编辑逆位"],
                  ["experience", "个人经验"],
                ].map(([value, label]) => (
                  <button
                    className={editTab === value ? "is-active" : ""}
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={editTab === value}
                    onClick={() => {
                      setEditTab(value as MeaningEditTab);
                      setComposer(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {editTab === "experience" ? (
                <label className="form-field form-field--wide">
                  <span>个人联想与案例经验</span>
                  <textarea
                    rows={8}
                    value={draft.personalAssociations}
                    onChange={(event) =>
                      updateDraft({
                        personalAssociations: event.currentTarget.value,
                      })
                    }
                    placeholder="记录个人联想、重复规律、特殊组合或个人经历。"
                  />
                </label>
              ) : (
                <DirectionEditor
                  direction={activeDirection}
                  summary={
                    activeDirection === "upright"
                      ? draft.uprightSummary
                      : draft.reversedSummary
                  }
                  entries={
                    activeDirection === "upright"
                      ? draft.uprightEntries
                      : draft.reversedEntries
                  }
                  onSummaryChange={(value) =>
                    updateDraft(
                      activeDirection === "upright"
                        ? { uprightSummary: value }
                        : { reversedSummary: value },
                    )
                  }
                  onEntryChange={(entryId, content) =>
                    updateEntries(activeDirection, (entries) =>
                      entries.map((entry) =>
                        entry.id === entryId ? { ...entry, content } : entry,
                      ),
                    )
                  }
                  onDeleteEntry={(entry) =>
                    deleteEntry(activeDirection, entry)
                  }
                  onStartAdding={() =>
                    setComposer(createEntryComposer(activeDirection))
                  }
                />
              )}

              {saveError && (
                <p className="form-message is-error" role="alert">
                  {saveError}
                </p>
              )}
            </form>
          )}
        </div>

        <footer className="personal-meaning-actions">
          {mode === "view" ? (
            <button
              className="primary-action"
              type="button"
              onClick={startEditing}
            >
              编辑牌意
            </button>
          ) : (
            <>
              <button
                className="secondary-action"
                type="button"
                onClick={cancelEditing}
              >
                取消
              </button>
              <button
                className="primary-action"
                type="submit"
                form="personal-meaning-edit-form"
              >
                保存牌意
              </button>
            </>
          )}
        </footer>
      </section>
      {composer && (
        <MeaningEntryModal
          composer={composer}
          onChange={setComposer}
          onCancel={() => setComposer(null)}
          onAdd={addEntry}
        />
      )}
    </div>
  );
}
