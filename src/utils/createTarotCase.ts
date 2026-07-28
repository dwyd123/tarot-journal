import { TAROT_CARDS } from "../data/tarotCards";
import type { DemoSelections } from "../types/demo";
import type {
  CaseCategory,
  CasePosition,
  SpreadTemplate,
  TarotCase,
  TemplateSpreadSnapshot,
} from "../types/tarot";
import { calculateCaseStatus } from "./calculateCaseStatus";

export const TAROT_CASE_DATA_VERSION = 1;

export interface CreateTarotCaseInput {
  readingDate: string;
  question: string;
  overallInterpretation: string;
  querentCode?: string;
  category?: CaseCategory;
  background?: string;
  advice?: string;
  followUp?: string;
  reviewNotes?: string;
  template: SpreadTemplate;
  selections: DemoSelections;
}

export function generateTarotCaseTitle(
  question: string,
  readingDate: string,
  templateName: string,
): string {
  const normalizedQuestion = question.trim();

  if (!normalizedQuestion) {
    return `${readingDate} ${templateName}`;
  }

  return normalizedQuestion.length > 30
    ? `${normalizedQuestion.slice(0, 30)}…`
    : normalizedQuestion;
}

export function createTemplateSpreadSnapshot(
  template: SpreadTemplate,
  selections: DemoSelections,
): TemplateSpreadSnapshot {
  const positions: CasePosition[] = template.positions.map((position) => {
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
    templateId: template.templateId,
    templateVersion: template.templateVersion,
    templateName: template.templateName,
    templateDescription: template.templateDescription,
    positions,
  };
}

function optionalText(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
}

/** 根据页面中的牌阵结果和表单内容建立可长期保存的正式案例。 */
export function createTarotCase(input: CreateTarotCaseInput): TarotCase {
  const question = input.question.trim();
  const overallInterpretation = input.overallInterpretation.trim();
  const readingDate = input.readingDate.trim();

  if (!question) {
    throw new Error("请填写问题。");
  }

  if (!overallInterpretation) {
    throw new Error("请填写综合解读。");
  }

  if (!readingDate) {
    throw new Error("请选择占卜日期。");
  }

  const timestamp = new Date().toISOString();
  const followUp = optionalText(input.followUp);
  const reviewNotes = optionalText(input.reviewNotes);
  const spreadSnapshot = createTemplateSpreadSnapshot(
    input.template,
    input.selections,
  );

  return {
    id: crypto.randomUUID(),
    dataVersion: TAROT_CASE_DATA_VERSION,
    title: generateTarotCaseTitle(
      question,
      readingDate,
      input.template.templateName,
    ),
    readingDate,
    querentCode: optionalText(input.querentCode),
    category: input.category,
    question,
    overallInterpretation,
    background: optionalText(input.background),
    advice: optionalText(input.advice),
    followUp,
    reviewNotes,
    tags: [],
    isFavorite: false,
    status: calculateCaseStatus(followUp, reviewNotes),
    createdAt: timestamp,
    updatedAt: timestamp,
    spreadMode: "template",
    spreadSnapshot,
  };
}
