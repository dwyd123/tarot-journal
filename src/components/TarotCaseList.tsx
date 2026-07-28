import { useState } from "react";
import type { CaseCategory, CaseStatus, TarotCase } from "../types/tarot";
import {
  getVisibleTarotCases,
  type CaseSortOption,
} from "../utils/getVisibleTarotCases";
import { CaseToolbar } from "./CaseToolbar";
import { TarotCaseListItem } from "./TarotCaseListItem";

interface TarotCaseListProps {
  cases: TarotCase[];
  invalidCount: number;
  message?: string;
  mode: "all" | "favorites";
  onCreate: () => void;
  onOpen: (caseId: string) => void;
  onToggleFavorite: (caseId: string) => void;
  onViewModeChange: (mode: "all" | "favorites") => void;
}

export function TarotCaseList({
  cases,
  invalidCount,
  message,
  mode,
  onCreate,
  onOpen,
  onToggleFavorite,
  onViewModeChange,
}: TarotCaseListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CaseStatus | "全部">("全部");
  const [category, setCategory] = useState<CaseCategory | "全部">("全部");
  const [sort, setSort] = useState<CaseSortOption>("recent-reading");
  const scopedCases =
    mode === "favorites"
      ? cases.filter((tarotCase) => tarotCase.isFavorite)
      : cases;
  const visibleCases = getVisibleTarotCases(scopedCases, {
    search,
    status,
    category,
    sort,
  });
  const hasSearch = Boolean(search.trim());
  const hasFilters = status !== "全部" || category !== "全部";

  return (
    <section
      className="case-list-view cases-home"
      aria-labelledby="case-list-title"
    >
      <div className="cases-home__heading">
        <div>
          <h2 id="case-list-title">
            {mode === "favorites" ? "收藏案例" : "我的案例"}
          </h2>
          <p>
            {mode === "favorites"
              ? "集中查看你标记的重要案例。"
              : "查看、管理和复盘你的塔罗记录"}
          </p>
        </div>
        <button
          className="primary-action cases-home__desktop-create"
          type="button"
          onClick={onCreate}
        >
          ＋ 新建案例
        </button>
      </div>

      <div className="cases-home__mobile-mode" aria-label="案例查看范围">
        <button
          className={mode === "all" ? "is-active" : ""}
          type="button"
          aria-pressed={mode === "all"}
          onClick={() => onViewModeChange("all")}
        >
          全部案例
        </button>
        <button
          className={mode === "favorites" ? "is-active" : ""}
          type="button"
          aria-pressed={mode === "favorites"}
          onClick={() => onViewModeChange("favorites")}
        >
          收藏案例
        </button>
      </div>

      {message && (
        <p className="view-message" role="status">
          {message}
        </p>
      )}

      <CaseToolbar
        category={category}
        search={search}
        sort={sort}
        status={status}
        onCategoryChange={setCategory}
        onClearFilters={() => {
          setStatus("全部");
          setCategory("全部");
        }}
        onSearchChange={setSearch}
        onSortChange={setSort}
        onStatusChange={setStatus}
      />

      {invalidCount > 0 && (
        <p className="form-message is-error" role="alert">
          有 {invalidCount} 条本地记录暂时无法读取，原始数据仍保留在浏览器中。
        </p>
      )}

      {scopedCases.length === 0 ? (
        <div className="case-list-empty">
          <span aria-hidden="true">✦</span>
          <h3>
            {mode === "favorites" ? "还没有收藏案例" : "还没有案例"}
          </h3>
          {mode === "favorites" ? (
            <>
              <p>
                点击案例卡片上的星标，
                <br />
                可以把重要案例保存在这里。
              </p>
              <button
                className="secondary-action"
                type="button"
                onClick={() => onViewModeChange("all")}
              >
                查看全部案例
              </button>
            </>
          ) : (
            <>
              <p>
                记录你的第一次塔罗解读，
                <br />
                以后可以回来补充反馈和复盘。
              </p>
              <button
                className="primary-action"
                type="button"
                onClick={onCreate}
              >
                新建案例
              </button>
            </>
          )}
        </div>
      ) : visibleCases.length > 0 ? (
        <>
          <p className="cases-home__result-count" role="status">
            显示 {visibleCases.length} 条
            {mode === "favorites" ? "收藏案例" : "案例"}
          </p>
          <div className="case-list-grid">
            {visibleCases.map((tarotCase) => (
              <TarotCaseListItem
                key={tarotCase.id}
                tarotCase={tarotCase}
                onOpen={onOpen}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="case-list-empty is-search-empty">
          <span aria-hidden="true">✦</span>
          <h3>没有找到匹配的案例</h3>
          <p>可以清除搜索或筛选后再查看。</p>
          <div>
            {hasSearch && (
              <button
                className="secondary-action"
                type="button"
                onClick={() => setSearch("")}
              >
                清除搜索
              </button>
            )}
            {hasFilters && (
              <button
                className="secondary-action"
                type="button"
                onClick={() => {
                  setStatus("全部");
                  setCategory("全部");
                }}
              >
                清除筛选
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
