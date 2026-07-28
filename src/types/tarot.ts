/** 第一版支持的问题分类。 */
export type CaseCategory =
  | "感情"
  | "事业"
  | "财务"
  | "学业"
  | "人际关系"
  | "今日运势"
  | "其他";

/** 案例在后续跟进中的状态。 */
export type CaseStatus = "待反馈" | "已反馈" | "已复盘";

/** 第一版界面只开放 template，free 为后续版本预留。 */
export type SpreadMode = "template" | "free";

/** 实际抽牌的正逆位。 */
export type CardOrientation = "正位" | "逆位";

/** 牌面图形横放或竖放，与正逆位无关。 */
export type DisplayOrientation = "portrait" | "landscape";

export type Arcana = "大阿尔卡那" | "小阿尔卡那";

export type TarotSuit = "权杖" | "圣杯" | "宝剑" | "星币";

export type CourtRank = "侍从" | "骑士" | "王后" | "国王";

/** 由开发者预先设置的模板牌位。 */
export interface SpreadTemplatePosition {
  positionId: string;
  order: number;
  positionName: string;
  positionMeaning: string;
  /** 0～100 的横向相对位置。 */
  x: number;
  /** 0～100 的纵向相对位置。 */
  y: number;
  displayOrientation: DisplayOrientation;
  rotation: number;
}

export interface SpreadTemplate {
  templateId: string;
  templateVersion: number;
  templateName: string;
  templateDescription: string;
  positions: SpreadTemplatePosition[];
}

/** 一张标准维特塔罗牌的基础资料。 */
export interface TarotCardDefinition {
  /**
   * 标准意义上的牌身份，不依赖某套牌组的牌序编号。
   * 同一张牌在不同体系中即使编号不同，cardId 也保持不变。
   */
  cardId: string;
  nameZh: string;
  nameEn: string;
  arcana: Arcana;
  /** 大阿尔卡那没有花色，因此为 null。 */
  suit: TarotSuit | null;
  /** 第一版维特基础资料中的默认顺序。 */
  rank: number | CourtRank;
  /** 第一版的默认显示编号，不是所有牌组永久通用的编号。 */
  displayNumber: string;
  /** 当前默认牌组的牌面地址；为空时显示文字占位牌。 */
  imagePath: string | null;
}

/** 历史案例会完整保留牌位布局和实际抽牌结果。 */
export interface CasePosition {
  positionId: string;
  order: number;
  positionName: string;
  positionMeaning: string;
  x: number;
  y: number;
  displayOrientation: DisplayOrientation;
  rotation: number;
  /** 指向标准意义上的牌，不依赖具体牌组的显示编号。 */
  cardId: string;
  cardNameSnapshot: string;
  orientation: CardOrientation;
  firstImpression?: string;
  interpretation?: string;
}

export interface TemplateSpreadSnapshot {
  templateId: string;
  templateVersion: number;
  templateName: string;
  templateDescription: string;
  positions: CasePosition[];
}

/** 后续版本的无固定牌阵模式，第一版界面不开放。 */
export interface FreeSpreadSnapshot {
  templateId: null;
  templateVersion: null;
  templateName: "无固定牌阵";
  templateDescription: string;
  positions: [];
}

export interface TarotCaseBase {
  id: string;
  dataVersion: number;
  title: string;
  readingDate: string;
  querentCode?: string;
  category?: CaseCategory;
  question: string;
  deckName?: string;
  overallInterpretation: string;
  /** 咨询者背景、事件上下文或解读时需要参考的信息。 */
  background?: string;
  advice?: string;
  followUp?: string;
  reviewNotes?: string;
  tags: string[];
  isFavorite: boolean;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
}

/** spreadMode 与相应的快照类型保持一致。 */
export type TarotCase =
  | (TarotCaseBase & {
      spreadMode: "template";
      spreadSnapshot: TemplateSpreadSnapshot;
    })
  | (TarotCaseBase & {
      spreadMode: "free";
      spreadSnapshot: FreeSpreadSnapshot;
    });

/** 未来用于描述一套具体牌组。 */
export interface DeckDefinition {
  deckId: string;
  deckName: string;
  description?: string;
}

/** 未来用 cardId + deckId 覆盖具体牌组的显示编号和图片。 */
export interface DeckCardImage {
  deckId: string;
  cardId: string;
  displayNumber?: string;
  imagePath: string;
}
