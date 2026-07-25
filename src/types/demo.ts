import type { CardOrientation } from "./tarot";

/** 第三阶段演示中，一个牌位的临时抽牌结果。 */
export interface DemoPositionSelection {
  cardId: string | null;
  orientation: CardOrientation | null;
}

/** 每个positionId分别保存自己的牌和正逆位。 */
export type DemoSelections = Record<string, DemoPositionSelection>;
