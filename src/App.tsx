import { useEffect, useRef, useState } from "react";
import { MyTarotDeck } from "./components/MyTarotDeck";
import { PersonalCardMeaningModal } from "./components/PersonalCardMeaningModal";
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
import type { TarotCase } from "./types/tarot";
import type { TarotCaseFormSubmitResult } from "./components/TarotCaseForm";

type AppView =
  | { name: "list" }
  | { name: "create" }
  | { name: "detail"; caseId: string }
  | { name: "edit"; caseId: string }
  | { name: "deck" };

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
  const [hasUnsavedEditChanges, setHasUnsavedEditChanges] = useState(false);
  const editorTopRef = useRef<HTMLDivElement>(null);

  const selectedCase =
    view.name === "detail" || view.name === "edit"
      ? caseLibrary.cases.find((tarotCase) => tarotCase.id === view.caseId)
      : undefined;
  const personalMeaningCard = personalMeaningCardId
    ? TAROT_CARDS.find((card) => card.cardId === personalMeaningCardId)
    : undefined;
  const isCaseLibraryView =
    view.name === "list" || view.name === "detail" || view.name === "edit";

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
    if (
      view.name === "edit" &&
      hasUnsavedEditChanges &&
      !window.confirm("当前修改尚未保存，确定离开吗？")
    ) {
      return;
    }

    setHasUnsavedEditChanges(false);
    setViewMessage("");
    setView(nextView);
  }

  function handleCreateCase(
    tarotCase: TarotCase,
  ): TarotCaseFormSubmitResult {
    try {
      addTarotCase(tarotCase);
      refreshCaseLibrary();
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
              记录、查看和复盘保存在当前浏览器中的塔罗案例。
            </p>
          </div>
        </div>

        <div className="intro-card__tools">
          <div className="data-summary" aria-label="本地数据状态">
            <p>
              <strong>{caseLibrary.cases.length}</strong>
              <span>条本地案例</span>
            </p>
            <p>
              <strong>{personalMeaningCardIds.size}</strong>
              <span>张个人牌意</span>
            </p>
          </div>

          <nav className="app-navigation" aria-label="主要页面">
            <button
              className={isCaseLibraryView ? "is-active" : ""}
              type="button"
              aria-current={isCaseLibraryView ? "page" : undefined}
              onClick={() => navigate({ name: "list" })}
            >
              我的案例
            </button>
            <button
              className={view.name === "create" ? "is-active" : ""}
              type="button"
              aria-current={view.name === "create" ? "page" : undefined}
              onClick={() => navigate({ name: "create" })}
            >
              新建案例
            </button>
            <button
              className={view.name === "deck" ? "is-active" : ""}
              type="button"
              aria-current={view.name === "deck" ? "page" : undefined}
              onClick={() => navigate({ name: "deck" })}
            >
              我的牌库
            </button>
          </nav>
        </div>
      </header>

      <div className="content-shell">
        {view.name === "list" && (
          <TarotCaseList
            cases={caseLibrary.cases}
            invalidCount={caseLibrary.invalidCount}
            message={viewMessage}
            onCreate={() => navigate({ name: "create" })}
            onOpen={(caseId) => navigate({ name: "detail", caseId })}
          />
        )}

        {view.name === "create" && (
          <TarotCaseCreateView
            personalMeaningCardIds={personalMeaningCardIds}
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

        <footer className="scope-note">
          <span aria-hidden="true">✦</span>
          <p>
            所有案例和个人牌意仅保存在当前浏览器；暂不包含云端同步和登录。
          </p>
        </footer>
      </div>

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
