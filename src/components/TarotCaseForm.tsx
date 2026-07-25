import { useRef, useState } from "react";
import type { CaseCategory } from "../types/tarot";
import {
  OptionalCaseFields,
  type OptionalCaseValues,
} from "./OptionalCaseFields";

export interface TarotCaseFormValues {
  readingDate: string;
  question: string;
  overallInterpretation: string;
  querentCode?: string;
  category?: CaseCategory;
  advice?: string;
  followUp?: string;
  reviewNotes?: string;
}

export interface TarotCaseFormSubmitResult {
  success: boolean;
  error?: string;
}

interface TarotCaseFormProps {
  templateName: string;
  completedPositionCount: number;
  totalPositionCount: number;
  onSave: (values: TarotCaseFormValues) => TarotCaseFormSubmitResult;
}

function getTodayInLocalTime(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const EMPTY_OPTIONAL_VALUES: OptionalCaseValues = {
  querentCode: "",
  category: "",
  advice: "",
  followUp: "",
  reviewNotes: "",
};

/** 正式案例内容表单；标题和系统字段均不要求用户填写。 */
export function TarotCaseForm({
  templateName,
  completedPositionCount,
  totalPositionCount,
  onSave,
}: TarotCaseFormProps) {
  const [readingDate, setReadingDate] = useState(getTodayInLocalTime);
  const [question, setQuestion] = useState("");
  const [overallInterpretation, setOverallInterpretation] = useState("");
  const [optionalValues, setOptionalValues] = useState<OptionalCaseValues>(
    EMPTY_OPTIONAL_VALUES,
  );
  const [formError, setFormError] = useState("");
  const dateRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const interpretationRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!question.trim()) {
      setFormError("请填写具体问题。");
      questionRef.current?.focus();
      return;
    }

    if (!overallInterpretation.trim()) {
      setFormError("请填写综合解读。");
      interpretationRef.current?.focus();
      return;
    }

    if (!readingDate) {
      setFormError("请选择占卜日期。");
      dateRef.current?.focus();
      return;
    }

    if (completedPositionCount !== totalPositionCount) {
      setFormError("请先完成牌阵中的所有牌位。");
      return;
    }

    const result = onSave({
      readingDate,
      question,
      overallInterpretation,
      querentCode: optionalValues.querentCode,
      category: optionalValues.category || undefined,
      advice: optionalValues.advice,
      followUp: optionalValues.followUp,
      reviewNotes: optionalValues.reviewNotes,
    });

    if (!result.success) {
      setFormError(result.error ?? "案例保存失败，请稍后重试。");
      return;
    }

    setFormError("");
  }

  return (
    <section className="case-form-section" aria-labelledby="case-form-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">步骤 2 · 填写内容</p>
          <h2 id="case-form-title">记录这次解读</h2>
        </div>
        <p>标题和系统信息会在保存时自动生成。</p>
      </div>

      <form className="case-form" noValidate onSubmit={handleSubmit}>
        <div className="case-auto-info" aria-label="案例自动信息">
          <label className="form-field">
            <span>
              占卜日期 <b aria-hidden="true">*</b>
            </span>
            <input
              ref={dateRef}
              type="date"
              value={readingDate}
              onChange={(event) => setReadingDate(event.currentTarget.value)}
            />
          </label>

          <div>
            <span>当前牌阵</span>
            <strong>{templateName}</strong>
          </div>
        </div>

        <label className="form-field form-field--wide">
          <span>
            具体问题 <b aria-hidden="true">*</b>
          </span>
          <textarea
            ref={questionRef}
            rows={3}
            value={question}
            aria-invalid={Boolean(formError && !question.trim())}
            onChange={(event) => setQuestion(event.currentTarget.value)}
            placeholder="例如：未来三个月的转行发展如何？"
          />
        </label>

        <label className="form-field form-field--wide">
          <span>
            综合解读 <b aria-hidden="true">*</b>
          </span>
          <textarea
            ref={interpretationRef}
            rows={6}
            value={overallInterpretation}
            aria-invalid={Boolean(
              formError && !overallInterpretation.trim(),
            )}
            onChange={(event) =>
              setOverallInterpretation(event.currentTarget.value)
            }
            placeholder="结合问题、牌阵与各张牌，记录整体脉络和结论"
          />
        </label>

        <OptionalCaseFields
          values={optionalValues}
          onChange={setOptionalValues}
        />

        {formError && (
          <p className="form-message is-error" role="alert">
            {formError}
          </p>
        )}

        <div className="case-form__actions">
          <p>
            保存后会写入当前浏览器，不会上传到云端。
          </p>
          <button className="primary-action" type="submit">
            步骤 3 · 保存案例
          </button>
        </div>
      </form>
    </section>
  );
}
