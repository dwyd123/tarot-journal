import { TAROT_CARDS } from "../data/tarotCards";
import type { DemoSelections } from "../types/demo";
import type {
  CaseCategory,
  CasePosition,
  TarotCase,
  TemplateSpreadSnapshot,
} from "../types/tarot";
import { calculateCaseStatus } from "./calculateCaseStatus";
import { generateTarotCaseTitle } from "./createTarotCase";

export interface UpdateTarotCaseInput {
  readingDate: string;
  question: string;
  overallInterpretation: string;
  querentCode?: string;
  category?: CaseCategory;
  advice?: string;
  followUp?: string;
  reviewNotes?: string;
  selections: DemoSelections;
}

function optionalText(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
}

function updateSpreadSnapshot(
  snapshot: TemplateSpreadSnapshot,
  selections: DemoSelections,
): TemplateSpreadSnapshot {
  const positions: CasePosition[] = snapshot.positions.map((position) => {
    const selection = selections[position.positionId];

    if (!selection?.cardId || !selection.orientation) {
      throw new Error(`牌位“${position.positionName}”尚未完成选牌。`);
    }

    const card = TAROT_CARDS.find(
      (candidate) => candidate.cardId === selection.cardId,
    );

    if (!card) {
      throw new Error(`牌位“${position.positionName}”关联的塔罗牌不存在。`);
    }

    return {
      ...position,
      cardId: card.cardId,
      cardNameSnapshot: card.nameZh,
      orientation: selection.orientation,
    };
  });

  return {
    ...snapshot,
    positions,
  };
}

/** 在保留案例身份与创建时间的前提下生成更新后的案例。 */
export function createUpdatedTarotCase(
  originalCase: TarotCase,
  input: UpdateTarotCaseInput,
): TarotCase {
  if (originalCase.spreadMode !== "template") {
    throw new Error("当前版本暂不支持编辑无固定牌阵案例。");
  }

  const readingDate = input.readingDate.trim();
  const question = input.question.trim();
  const overallInterpretation = input.overallInterpretation.trim();

  if (!readingDate) {
    throw new Error("请选择占卜日期。");
  }

  if (!question) {
    throw new Error("请填写问题。");
  }

  if (!overallInterpretation) {
    throw new Error("请填写综合解读。");
  }

  const followUp = optionalText(input.followUp);
  const reviewNotes = optionalText(input.reviewNotes);

  return {
    ...originalCase,
    title: generateTarotCaseTitle(
      question,
      readingDate,
      originalCase.spreadSnapshot.templateName,
    ),
    readingDate,
    querentCode: optionalText(input.querentCode),
    category: input.category,
    question,
    overallInterpretation,
    advice: optionalText(input.advice),
    followUp,
    reviewNotes,
    status: calculateCaseStatus(followUp, reviewNotes),
    updatedAt: new Date().toISOString(),
    spreadSnapshot: updateSpreadSnapshot(
      originalCase.spreadSnapshot,
      input.selections,
    ),
  };
}
