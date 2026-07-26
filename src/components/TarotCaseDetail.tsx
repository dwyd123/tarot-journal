import type { TarotCase } from "../types/tarot";
import { formatDateTime } from "../utils/formatDate";
import { CaseSpreadView } from "./CaseSpreadView";

interface TarotCaseDetailProps {
  tarotCase: TarotCase;
  message?: string;
  onBack: () => void;
  onDelete: (caseId: string) => void;
  onEdit: (caseId: string) => void;
  onOpenPersonalMeaning: (cardId: string) => void;
}

interface OptionalDetailProps {
  label: string;
  value?: string;
}

function OptionalDetail({ label, value }: OptionalDetailProps) {
  if (!value) {
    return null;
  }

  return (
    <section className="case-detail__text-block">
      <h3>{label}</h3>
      <p>{value}</p>
    </section>
  );
}

export function TarotCaseDetail({
  tarotCase,
  message,
  onBack,
  onDelete,
  onEdit,
  onOpenPersonalMeaning,
}: TarotCaseDetailProps) {
  if (tarotCase.spreadMode !== "template") {
    return (
      <section className="case-not-found">
        <h2>当前版本暂不支持展示这条无固定牌阵案例</h2>
        <button className="secondary-action" type="button" onClick={onBack}>
          返回案例列表
        </button>
      </section>
    );
  }

  return (
    <article className="case-detail-view" aria-labelledby="case-detail-title">
      <button className="back-action" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> 返回案例列表
      </button>

      {message && (
        <p className="view-message" role="status">
          {message}
        </p>
      )}

      <header className="case-detail__header">
        <div>
          <p className="section-kicker">案例详情</p>
          <h2 id="case-detail-title">{tarotCase.title}</h2>
        </div>
        <span className="case-status-badge">{tarotCase.status}</span>
      </header>

      <dl className="case-detail__meta">
        <div>
          <dt>占卜日期</dt>
          <dd>{tarotCase.readingDate}</dd>
        </div>
        <div>
          <dt>牌阵</dt>
          <dd>{tarotCase.spreadSnapshot.templateName}</dd>
        </div>
        <div>
          <dt>创建时间</dt>
          <dd>{formatDateTime(tarotCase.createdAt)}</dd>
        </div>
        <div>
          <dt>最后修改</dt>
          <dd>{formatDateTime(tarotCase.updatedAt)}</dd>
        </div>
      </dl>

      {(tarotCase.querentCode || tarotCase.category) && (
        <div className="case-detail__optional-meta">
          {tarotCase.querentCode && (
            <span>咨询者：{tarotCase.querentCode}</span>
          )}
          {tarotCase.category && <span>分类：{tarotCase.category}</span>}
        </div>
      )}

      <section className="case-detail__question">
        <p className="section-kicker">问题</p>
        <h3>{tarotCase.question}</h3>
      </section>

      <CaseSpreadView
        snapshot={tarotCase.spreadSnapshot}
        onOpenPersonalMeaning={onOpenPersonalMeaning}
      />

      <section className="case-detail__text-block is-primary">
        <h3>综合解读</h3>
        <p>{tarotCase.overallInterpretation}</p>
      </section>

      <div className="case-detail__optional-content">
        <OptionalDetail label="建议" value={tarotCase.advice} />
        <OptionalDetail label="后续反馈" value={tarotCase.followUp} />
        <OptionalDetail label="复盘笔记" value={tarotCase.reviewNotes} />
      </div>

      <footer className="case-detail__actions">
        <button
          className="primary-action"
          type="button"
          onClick={() => onEdit(tarotCase.id)}
        >
          编辑案例
        </button>
        <button
          className="danger-action"
          type="button"
          onClick={() => onDelete(tarotCase.id)}
        >
          <span aria-hidden="true">⚠</span> 删除案例
        </button>
      </footer>
    </article>
  );
}
