import { useEffect, useState } from "react";
import type { CaseCategory, CaseStatus } from "../types/tarot";
import type { CaseSortOption } from "../utils/getVisibleTarotCases";

interface CaseToolbarProps {
  category: CaseCategory | "全部";
  search: string;
  sort: CaseSortOption;
  status: CaseStatus | "全部";
  onCategoryChange: (category: CaseCategory | "全部") => void;
  onClearFilters: () => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: CaseSortOption) => void;
  onStatusChange: (status: CaseStatus | "全部") => void;
}

const STATUS_OPTIONS: Array<CaseStatus | "全部"> = [
  "全部",
  "待反馈",
  "已反馈",
  "已复盘",
];

const CATEGORY_OPTIONS: Array<CaseCategory | "全部"> = [
  "全部",
  "感情",
  "事业",
  "财务",
  "学业",
  "人际关系",
  "今日运势",
  "其他",
];

export function CaseToolbar({
  category,
  search,
  sort,
  status,
  onCategoryChange,
  onClearFilters,
  onSearchChange,
  onSortChange,
  onStatusChange,
}: CaseToolbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const activeFilterCount =
    Number(status !== "全部") + Number(category !== "全部");

  useEffect(() => {
    if (!isFilterOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    if (window.matchMedia("(max-width: 899px)").matches) {
      document.body.style.overflow = "hidden";
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setIsFilterOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFilterOpen]);

  return (
    <div className="case-toolbar">
      <label className="case-search">
        <span className="sr-only">搜索案例</span>
        <span aria-hidden="true">⌕</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder="搜索问题、咨询者或牌阵"
        />
      </label>

      <div className="case-toolbar__actions">
        <button
          className={`case-filter-trigger${activeFilterCount ? " is-active" : ""}`}
          type="button"
          aria-expanded={isFilterOpen}
          onClick={() => setIsFilterOpen((current) => !current)}
        >
          <span aria-hidden="true">⌁</span>
          筛选
          {activeFilterCount > 0 && (
            <strong aria-label={`已启用 ${activeFilterCount} 项筛选`}>
              {activeFilterCount}
            </strong>
          )}
        </button>

        <label className="case-sort-control">
          <span>排序</span>
          <select
            aria-label="案例排序"
            value={sort}
            onChange={(event) =>
              onSortChange(event.currentTarget.value as CaseSortOption)
            }
          >
            <option value="recent-reading">最近占卜</option>
            <option value="earliest-reading">最早占卜</option>
            <option value="recent-updated">最近修改</option>
            <option value="earliest-created">最早创建</option>
          </select>
        </label>
      </div>

      {isFilterOpen && (
        <div className="case-filter-layer">
          <section
            className="case-filter-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-filter-title"
          >
            <header>
              <div>
                <h2 id="case-filter-title">筛选案例</h2>
                <p>状态和分类可以同时使用。</p>
              </div>
              <button
                type="button"
                aria-label="关闭筛选"
                onClick={() => setIsFilterOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <div className="case-filter-panel__fields">
              <label>
                <span>案例状态</span>
                <select
                  value={status}
                  onChange={(event) =>
                    onStatusChange(
                      event.currentTarget.value as CaseStatus | "全部",
                    )
                  }
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>问题分类</span>
                <select
                  value={category}
                  onChange={(event) =>
                    onCategoryChange(
                      event.currentTarget.value as CaseCategory | "全部",
                    )
                  }
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <footer>
              <button
                className="secondary-action"
                type="button"
                disabled={activeFilterCount === 0}
                onClick={onClearFilters}
              >
                清除筛选
              </button>
              <button
                className="primary-action"
                type="button"
                onClick={() => setIsFilterOpen(false)}
              >
                查看结果
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
