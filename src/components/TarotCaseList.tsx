import type { TarotCase } from "../types/tarot";
import { sortTarotCases } from "../utils/sortTarotCases";
import { TarotCaseListItem } from "./TarotCaseListItem";

interface TarotCaseListProps {
  cases: TarotCase[];
  invalidCount: number;
  message?: string;
  onCreate: () => void;
  onOpen: (caseId: string) => void;
}

export function TarotCaseList({
  cases,
  invalidCount,
  message,
  onCreate,
  onOpen,
}: TarotCaseListProps) {
  const sortedCases = sortTarotCases(cases);

  return (
    <section className="case-list-view" aria-labelledby="case-list-title">
      <div className="view-heading">
        <div>
          <p className="section-kicker">本地案例库</p>
          <h2 id="case-list-title">我的案例</h2>
          <p>共保存 {cases.length} 条案例，默认按占卜日期从新到旧排列。</p>
        </div>
        <button className="primary-action" type="button" onClick={onCreate}>
          新建案例
        </button>
      </div>

      {message && (
        <p className="view-message" role="status">
          {message}
        </p>
      )}

      {invalidCount > 0 && (
        <p className="form-message is-error" role="alert">
          有 {invalidCount} 条本地记录暂时无法读取，原始数据仍保留在浏览器中。
        </p>
      )}

      {sortedCases.length > 0 ? (
        <div className="case-list-grid">
          {sortedCases.map((tarotCase) => (
            <TarotCaseListItem
              key={tarotCase.id}
              tarotCase={tarotCase}
              onOpen={onOpen}
            />
          ))}
        </div>
      ) : (
        <div className="case-list-empty">
          <span aria-hidden="true">✦</span>
          <h3>还没有保存的案例。</h3>
          <p>完成一次牌阵和解读后，案例会保存在当前浏览器中。</p>
          <button className="primary-action" type="button" onClick={onCreate}>
            记录第一条案例
          </button>
        </div>
      )}
    </section>
  );
}
