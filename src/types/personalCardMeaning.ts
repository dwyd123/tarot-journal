/** 某个方向下的一条主题牌意。 */
export interface PersonalMeaningEntry {
  id: string;
  label: string;
  content: string;
}

/** 用户为一张标准塔罗牌长期积累的个人理解。 */
export interface PersonalCardMeaning {
  cardId: string;
  uprightSummary: string;
  uprightEntries: PersonalMeaningEntry[];
  reversedSummary: string;
  reversedEntries: PersonalMeaningEntry[];
  personalAssociations: string;
  createdAt: string;
  updatedAt: string;
}
