import { useEffect, useRef, useState } from "react";
import { AppShell } from "./components/AppShell";
import { MyTarotDeck } from "./components/MyTarotDeck";
import { PersonalCardMeaningModal } from "./components/PersonalCardMeaningModal";
import { PlaceholderPage } from "./components/PlaceholderPage";
import { TarotCaseCreateView } from "./components/TarotCaseCreateView";
import { TarotCaseDetail } from "./components/TarotCaseDetail";
import { TarotCaseEditor } from "./components/TarotCaseEditor";
import { TarotCaseList } from "./components/TarotCaseList";
import { TAROT_CARDS } from "./data/tarotCards";
import {
  hasPersonalCardMeaningContent,
  loadPersonalCardMeanings,
} from "./storage/personalCardMeaningStorage";
import {
  addTarotCase,
  deleteTarotCase,
  loadTarotCaseLibrary,
  updateTarotCase,
} from "./storage/tarotCaseStorage";
import type { PersonalCardMeaning } from "./types/personalCardMeaning";
import type { AppView } from "./types/navigation";
import type { TarotCase } from "./types/tarot";
import type { TarotCaseFormSubmitResult } from "./components/TarotCaseForm";

function App() {
  const [view, setView] = useState<AppView>({ name: "list" });
  const [caseLibrary, setCaseLibrary] = useState(loadTarotCaseLibrary);
  const [personalMeaningCardId, setPersonalMeaningCardId] = useState<
    string | null
  >(null);
  const [personalMeaningCardIds, setPersonalMeaningCardIds] = useState<
    Set<string>
  >(
    () =>
      new Set(
        loadPersonalCardMeanings()
          .filter(hasPersonalCardMeaningContent)
          .map((meaning) => meaning.cardId),
      ),
  );
  const [viewMessage, setViewMessage] = useState("");
  const [hasUnsavedCreateChanges, setHasUnsavedCreateChanges] =
    useState(false);
  const [hasUnsavedEditChanges, setHasUnsavedEditChanges] = useState(false);
  const [
    hasUnsavedPersonalMeaningChanges,
    setHasUnsavedPersonalMeaningChanges,
  ] = useState(false);
  const editorTopRef = useRef<HTMLDivElement>(null);

  const selectedCase =
    view.name === "detail" || view.name === "edit"
      ? caseLibrary.cases.find((tarotCase) => tarotCase.id === view.caseId)
      : undefined;
  const personalMeaningCard = personalMeaningCardId
    ? TAROT_CARDS.find((card) => card.cardId === personalMeaningCardId)
    : undefined;
  useEffect(() => {
    if (view.name === "edit") {
      editorTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [view]);

  function refreshCaseLibrary(): void {
    setCaseLibrary(loadTarotCaseLibrary());
  }

  function navigate(nextView: AppView): void {
    const hasUnsavedContent =
      (view.name === "create" && hasUnsavedCreateChanges) ||
      (view.name === "edit" && hasUnsavedEditChanges) ||
      Boolean(
        personalMeaningCardId && hasUnsavedPersonalMeaningChanges,
      );

    if (
      hasUnsavedContent &&
      !window.confirm("当前内容尚未保存，确定离开吗？")
    ) {
      return;
    }

    setHasUnsavedCreateChanges(false);
    setHasUnsavedEditChanges(false);
    setHasUnsavedPersonalMeaningChanges(false);
    setPersonalMeaningCardId(null);
    setViewMessage("");
    setView(nextView);
  }

  function handleCreateCase(
    tarotCase: TarotCase,
  ): TarotCaseFormSubmitResult {
    try {
      addTarotCase(tarotCase);
      refreshCaseLibrary();
      setHasUnsavedCreateChanges(false);
      setViewMessage("案例已保存。");
      setView({ name: "detail", caseId: tarotCase.id });
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

  function handleUpdateCase(
    tarotCase: TarotCase,
  ): TarotCaseFormSubmitResult {
    try {
      updateTarotCase(tarotCase);
      refreshCaseLibrary();
      setHasUnsavedEditChanges(false);
      setViewMessage("案例已更新。");
      setView({ name: "detail", caseId: tarotCase.id });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "案例更新失败，请稍后重试。",
      };
    }
  }

  function handleDeleteCase(caseId: string): void {
    if (!window.confirm("确定删除这条案例吗？删除后无法恢复。")) {
      return;
    }

    try {
      deleteTarotCase(caseId);
      refreshCaseLibrary();
      setViewMessage("案例已删除。");
      setView({ name: "list" });
    } catch (error) {
      setViewMessage(
        error instanceof Error ? error.message : "案例删除失败，请稍后重试。",
      );
    }
  }

  function handleToggleFavorite(caseId: string): void {
    const tarotCase = caseLibrary.cases.find(
      (candidate) => candidate.id === caseId,
    );

    if (!tarotCase) {
      setViewMessage("没有找到需要收藏的案例。");
      return;
    }

    try {
      updateTarotCase({
        ...tarotCase,
        isFavorite: !tarotCase.isFavorite,
      });
      refreshCaseLibrary();
      setViewMessage("");
    } catch (error) {
      setViewMessage(
        error instanceof Error
          ? error.message
          : "收藏状态更新失败，请稍后重试。",
      );
    }
  }

  function handlePersonalMeaningSaved(
    meaning: PersonalCardMeaning,
  ): void {
    setPersonalMeaningCardIds((current) => {
      const next = new Set(current);

      if (hasPersonalCardMeaningContent(meaning)) {
        next.add(meaning.cardId);
      } else {
        next.delete(meaning.cardId);
      }
      return next;
    });
  }

  return (
    <>
      <AppShell
        caseCount={caseLibrary.cases.length}
        personalMeaningCount={personalMeaningCardIds.size}
        view={view}
        onNavigate={navigate}
      >
        {(view.name === "list" || view.name === "favorites") && (
          <TarotCaseList
            cases={caseLibrary.cases}
            invalidCount={caseLibrary.invalidCount}
            message={viewMessage}
            mode={view.name === "favorites" ? "favorites" : "all"}
            onCreate={() => navigate({ name: "create" })}
            onOpen={(caseId) => navigate({ name: "detail", caseId })}
            onToggleFavorite={handleToggleFavorite}
            onViewModeChange={(mode) =>
              navigate({ name: mode === "favorites" ? "favorites" : "list" })
            }
          />
        )}

        {view.name === "create" && (
          <TarotCaseCreateView
            personalMeaningCardIds={personalMeaningCardIds}
            onDirtyChange={setHasUnsavedCreateChanges}
            onCreate={handleCreateCase}
            onOpenPersonalMeaning={setPersonalMeaningCardId}
          />
        )}

        {view.name === "detail" && selectedCase && (
          <TarotCaseDetail
            tarotCase={selectedCase}
            message={viewMessage}
            onBack={() => navigate({ name: "list" })}
            onDelete={handleDeleteCase}
            onEdit={(caseId) => {
              setHasUnsavedEditChanges(false);
              setViewMessage("");
              setView({ name: "edit", caseId });
            }}
            onOpenPersonalMeaning={setPersonalMeaningCardId}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {view.name === "edit" && selectedCase && (
          <div className="editor-scroll-anchor" ref={editorTopRef}>
            <TarotCaseEditor
              tarotCase={selectedCase}
              personalMeaningCardIds={personalMeaningCardIds}
              onCancel={() => {
                setHasUnsavedEditChanges(false);
                setViewMessage("");
                setView({ name: "detail", caseId: selectedCase.id });
              }}
              onDirtyChange={setHasUnsavedEditChanges}
              onOpenPersonalMeaning={setPersonalMeaningCardId}
              onSave={handleUpdateCase}
            />
          </div>
        )}

        {(view.name === "detail" || view.name === "edit") && !selectedCase && (
          <section className="case-not-found">
            <span aria-hidden="true">✦</span>
            <h2>未找到该案例</h2>
            <p>这条案例可能已被删除，或本地记录暂时无法读取。</p>
            <button
              className="primary-action"
              type="button"
              onClick={() => navigate({ name: "list" })}
            >
              返回案例列表
            </button>
          </section>
        )}

        {view.name === "deck" && (
          <MyTarotDeck
            personalMeaningCardIds={personalMeaningCardIds}
            onOpenPersonalMeaning={setPersonalMeaningCardId}
          />
        )}

        {view.name === "calendar" && <PlaceholderPage page="calendar" />}
        {view.name === "settings" && <PlaceholderPage page="settings" />}
      </AppShell>

      {personalMeaningCard && (
        <PersonalCardMeaningModal
          key={personalMeaningCard.cardId}
          card={personalMeaningCard}
          onClose={() => {
            setHasUnsavedPersonalMeaningChanges(false);
            setPersonalMeaningCardId(null);
          }}
          onDirtyChange={setHasUnsavedPersonalMeaningChanges}
          onSaved={handlePersonalMeaningSaved}
        />
      )}
    </>
  );
}

export default App;
