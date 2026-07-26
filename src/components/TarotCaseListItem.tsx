import type { TarotCase } from "../types/tarot";
import { formatDateTime } from "../utils/formatDate";

interface TarotCaseListItemProps {
  tarotCase: TarotCase;
  onOpen: (caseId: string) => void;
}

export function TarotCaseListItem({
  tarotCase,
  onOpen,
}: TarotCaseListItemProps) {
  return (
    <article className="case-list-item">
      <button
        className="case-list-item__open"
        type="button"
        onClick={() => onOpen(tarotCase.id)}
      >
        <div className="case-list-item__heading">
          <div>
            <p>{tarotCase.readingDate}</p>
            <h3>{tarotCase.title}</h3>
          </div>
          <span className="case-status-badge">{tarotCase.status}</span>
        </div>

        <div className="case-list-item__meta">
          {tarotCase.category && <span>{tarotCase.category}</span>}
          <span>{tarotCase.spreadSnapshot.templateName}</span>
          <span>{tarotCase.spreadSnapshot.positions.length} 张牌</span>
          {tarotCase.querentCode && <span>咨询者：{tarotCase.querentCode}</span>}
        </div>

        <div className="case-list-item__footer">
          <small>最后修改：{formatDateTime(tarotCase.updatedAt)}</small>
          <strong>
            查看案例 <span aria-hidden="true">→</span>
          </strong>
        </div>
      </button>
    </article>
  );
}
