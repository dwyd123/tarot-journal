import type { CaseCategory } from "../types/tarot";

const CASE_CATEGORIES: CaseCategory[] = [
  "感情",
  "事业",
  "财务",
  "学业",
  "人际关系",
  "今日运势",
  "其他",
];

export interface OptionalCaseValues {
  querentCode: string;
  category: CaseCategory | "";
  advice: string;
  followUp: string;
  reviewNotes: string;
}

interface OptionalCaseFieldsProps {
  values: OptionalCaseValues;
  defaultOpen?: boolean;
  onChange: (values: OptionalCaseValues) => void;
}

/** 不影响保存的补充信息，收纳在折叠区域中。 */
export function OptionalCaseFields({
  values,
  defaultOpen = false,
  onChange,
}: OptionalCaseFieldsProps) {
  function updateField<Key extends keyof OptionalCaseValues>(
    field: Key,
    value: OptionalCaseValues[Key],
  ): void {
    onChange({ ...values, [field]: value });
  }

  return (
    <details className="optional-case-fields" open={defaultOpen || undefined}>
      <summary>
        <span>补充信息</span>
        <small>咨询者、分类、建议、反馈与复盘均可稍后再写</small>
      </summary>

      <div className="optional-case-fields__grid">
        <label className="form-field">
          <span>咨询者名称或代号</span>
          <input
            type="text"
            value={values.querentCode}
            onChange={(event) =>
              updateField("querentCode", event.currentTarget.value)
            }
            placeholder="例如：L女士"
          />
        </label>

        <label className="form-field">
          <span>问题分类</span>
          <select
            value={values.category}
            onChange={(event) =>
              updateField(
                "category",
                event.currentTarget.value as CaseCategory | "",
              )
            }
          >
            <option value="">暂不分类</option>
            {CASE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field form-field--wide">
          <span>建议</span>
          <textarea
            rows={3}
            value={values.advice}
            onChange={(event) =>
              updateField("advice", event.currentTarget.value)
            }
            placeholder="可以采取的行动或需要留意的方向"
          />
        </label>

        <label className="form-field form-field--wide">
          <span>后续反馈</span>
          <textarea
            rows={3}
            value={values.followUp}
            onChange={(event) =>
              updateField("followUp", event.currentTarget.value)
            }
            placeholder="事情有进展后再补充也可以"
          />
        </label>

        <label className="form-field form-field--wide">
          <span>复盘笔记</span>
          <textarea
            rows={3}
            value={values.reviewNotes}
            onChange={(event) =>
              updateField("reviewNotes", event.currentTarget.value)
            }
            placeholder="记录这次解读中值得复盘的经验"
          />
        </label>
      </div>
    </details>
  );
}
