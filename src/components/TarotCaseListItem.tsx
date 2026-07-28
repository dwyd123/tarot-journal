import type { TarotCase } from "../types/tarot";
import { formatReadingDate } from "../utils/formatDate";

interface TarotCaseListItemProps {
  tarotCase: TarotCase;
  onOpen: (caseId: string) => void;
  onToggleFavorite: (caseId: string) => void;
}

export function TarotCaseListItem({
  tarotCase,
  onOpen,
  onToggleFavorite,
}: TarotCaseListItemProps) {
  return (
    <article className="case-list-item">
      <button
        className="case-list-item__open"
        type="button"
        aria-label={`查看案例：${tarotCase.question}`}
        onClick={() => onOpen(tarotCase.id)}
      >
        <div className="case-list-item__heading">
          <h3>{tarotCase.question}</h3>
          <span className="case-status-badge">{tarotCase.status}</span>
        </div>

        <div className="case-list-item__meta">
          <span>{tarotCase.spreadSnapshot.templateName}</span>
        </div>
      </button>

      <div className="case-list-item__footer">
        <button
          className="case-list-item__date-action"
          type="button"
          aria-label={`查看案例：${tarotCase.question}`}
          onClick={() => onOpen(tarotCase.id)}
        >
          {tarotCase.category && (
            <span className="case-category-badge">{tarotCase.category}</span>
          )}
          <time dateTime={tarotCase.readingDate}>
            {formatReadingDate(tarotCase.readingDate)}
          </time>
        </button>

        <button
          className={`case-list-item__favorite${
            tarotCase.isFavorite ? " is-favorite" : ""
          }`}
          type="button"
          aria-label={tarotCase.isFavorite ? "取消收藏案例" : "收藏案例"}
          aria-pressed={tarotCase.isFavorite}
          title={tarotCase.isFavorite ? "取消收藏案例" : "收藏案例"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(tarotCase.id);
          }}
        >
          <span aria-hidden="true">{tarotCase.isFavorite ? "★" : "☆"}</span>
        </button>
      </div>
    </article>
  );
}
