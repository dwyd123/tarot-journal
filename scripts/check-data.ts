import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { validateDataIntegrity } from "../src/data/dataIntegrity";
import { TAROT_CARDS } from "../src/data/tarotCards";
import {
  hasPersonalCardMeaningContent,
  normalizeStoredPersonalCardMeaning,
} from "../src/storage/personalCardMeaningStorage";
import {
  normalizeStoredCaseCategory,
  normalizeStoredTarotCase,
} from "../src/storage/tarotCaseStorage";
import type { TarotCase } from "../src/types/tarot";
import { calculateCaseStatus } from "../src/utils/calculateCaseStatus";
import { generateTarotCaseTitle } from "../src/utils/createTarotCase";
import { sortTarotCases } from "../src/utils/sortTarotCases";
import { createUpdatedTarotCase } from "../src/utils/updateTarotCase";

const summary = validateDataIntegrity();
const imageDirectory = resolve("public/tarot/rider-waite");
const directoryFiles = readdirSync(imageDirectory);
const cardImageFiles = directoryFiles.filter(
  (fileName) =>
    /\.jpe?g$/i.test(fileName) && fileName !== "CardBacks.jpg",
);
const expectedImageFiles = new Set(
  TAROT_CARDS.map((card) => `${card.cardId}.jpg`),
);
const missingImageFiles = [...expectedImageFiles].filter(
  (fileName) => !cardImageFiles.includes(fileName),
);
const extraImageFiles = cardImageFiles.filter(
  (fileName) => !expectedImageFiles.has(fileName),
);

if (cardImageFiles.length !== 78) {
  throw new Error(
    `牌面图片总数应为78张，当前为${cardImageFiles.length}张。`,
  );
}

if (missingImageFiles.length > 0) {
  throw new Error(`缺少牌面图片：${missingImageFiles.join("、")}`);
}

if (extraImageFiles.length > 0) {
  throw new Error(`存在未映射的牌面图片：${extraImageFiles.join("、")}`);
}

const longQuestion = "1234567890123456789012345678901";
const generatedLongTitle = generateTarotCaseTitle(
  longQuestion,
  "2026-01-01",
  "时间之流",
);
const fallbackTitle = generateTarotCaseTitle(
  "   ",
  "2026-01-01",
  "时间之流",
);

if (generatedLongTitle !== `${longQuestion.slice(0, 30)}…`) {
  throw new Error("案例自动标题没有按前30个字符截取并添加省略号。");
}

if (fallbackTitle !== "2026-01-01 时间之流") {
  throw new Error("空问题的案例自动标题回退规则不正确。");
}

const legacyCategoryExpectations = new Map<string, string | undefined>([
  ["工作", "事业"],
  ["人际", "人际关系"],
  ["自我探索", "其他"],
  ["寻物", "其他"],
  ["每日指引", "今日运势"],
  ["未知分类", undefined],
]);

for (const [storedCategory, expectedCategory] of legacyCategoryExpectations) {
  if (normalizeStoredCaseCategory(storedCategory) !== expectedCategory) {
    throw new Error(`旧问题分类“${storedCategory}”的兼容规则不正确。`);
  }
}

const legacyPersonalMeaning = normalizeStoredPersonalCardMeaning({
  cardId: "major-high-priestess",
  uprightMeaning: "直觉",
  reversedMeaning: "忽略内心",
  visualNotes: "旧版画面观察",
  personalAssociations: "个人经验",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

if (
  !legacyPersonalMeaning ||
  "visualNotes" in legacyPersonalMeaning ||
  legacyPersonalMeaning.uprightSummary !== "直觉" ||
  legacyPersonalMeaning.reversedSummary !== "忽略内心" ||
  legacyPersonalMeaning.uprightEntries.length !== 0 ||
  legacyPersonalMeaning.reversedEntries.length !== 0 ||
  legacyPersonalMeaning.personalAssociations !== "个人经验"
) {
  throw new Error("旧个人牌意数据的兼容规则不正确。");
}

const structuredPersonalMeaning = normalizeStoredPersonalCardMeaning({
  cardId: "major-high-priestess",
  uprightSummary: "",
  uprightEntries: [
    { id: "entry-1", label: "感情", content: "存在未表达的感受。" },
  ],
  reversedSummary: "",
  reversedEntries: [],
  personalAssociations: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

if (
  !structuredPersonalMeaning ||
  !hasPersonalCardMeaningContent(structuredPersonalMeaning)
) {
  throw new Error("新版个人牌意主题条目或“已记录”判断不正确。");
}

if (
  calculateCaseStatus() !== "待反馈" ||
  calculateCaseStatus("已有反馈") !== "已反馈" ||
  calculateCaseStatus("已有反馈", "已有复盘") !== "已复盘"
) {
  throw new Error("案例状态自动计算规则不正确。");
}

const originalCase: TarotCase = {
  id: "case-for-update-check",
  dataVersion: 1,
  title: "旧问题",
  readingDate: "2026-01-01",
  question: "旧问题",
  overallInterpretation: "旧解读",
  tags: [],
  isFavorite: false,
  status: "待反馈",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  spreadMode: "template",
  spreadSnapshot: {
    templateId: "single-card",
    templateVersion: 1,
    templateName: "单张牌",
    templateDescription: "测试牌阵",
    positions: [
      {
        positionId: "core",
        order: 1,
        positionName: "核心牌",
        positionMeaning: "核心信息",
        x: 50,
        y: 50,
        displayOrientation: "portrait",
        rotation: 0,
        cardId: "major-fool",
        cardNameSnapshot: "愚人",
        orientation: "正位",
      },
    ],
  },
};
const updatedCase = createUpdatedTarotCase(originalCase, {
  readingDate: "2026-01-02",
  question: "更新后的问题",
  overallInterpretation: "更新后的解读",
  background: "更新后的背景",
  followUp: "已有反馈",
  reviewNotes: "已有复盘",
  selections: {
    core: {
      cardId: "major-magician",
      orientation: "逆位",
    },
  },
});

if (
  updatedCase.id !== originalCase.id ||
  updatedCase.createdAt !== originalCase.createdAt ||
  updatedCase.updatedAt === originalCase.updatedAt ||
  updatedCase.title !== "更新后的问题" ||
  updatedCase.background !== "更新后的背景" ||
  updatedCase.status !== "已复盘" ||
  updatedCase.spreadSnapshot.positions[0]?.cardId !== "major-magician" ||
  updatedCase.spreadSnapshot.positions[0]?.orientation !== "逆位"
) {
  throw new Error("案例更新时的身份、时间、标题、状态或牌位规则不正确。");
}

const normalizedLegacyCase = normalizeStoredTarotCase({
  ...originalCase,
  category: "工作",
  tags: undefined,
  isFavorite: undefined,
  status: undefined,
});

if (
  !normalizedLegacyCase ||
  normalizedLegacyCase.category !== "事业" ||
  normalizedLegacyCase.background !== undefined ||
  normalizedLegacyCase.tags.length !== 0 ||
  normalizedLegacyCase.isFavorite !== false
) {
  throw new Error("旧案例缺少可选字段时的兼容规则不正确。");
}

const sortedCaseIds = sortTarotCases([
  {
    ...originalCase,
    id: "older-reading-date",
    readingDate: "2026-01-01",
    createdAt: "2026-01-03T00:00:00.000Z",
  },
  {
    ...originalCase,
    id: "same-date-earlier-created",
    readingDate: "2026-01-02",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    ...originalCase,
    id: "same-date-later-created",
    readingDate: "2026-01-02",
    createdAt: "2026-01-02T00:00:00.000Z",
  },
]).map((tarotCase) => tarotCase.id);

if (
  sortedCaseIds.join(",") !==
  "same-date-later-created,same-date-earlier-created,older-reading-date"
) {
  throw new Error("案例列表的日期与创建时间排序规则不正确。");
}

console.log("数据完整性检查通过");
console.log(`- 塔罗牌总数：${summary.cardCount}`);
console.log(`- 非空且唯一的牌面路径：${summary.imagePathCount}`);
console.log(`- 实际牌面图片：${cardImageFiles.length}`);
console.log(`- 大阿尔卡那：${summary.majorArcanaCount}`);
console.log(`- 权杖：${summary.suitCounts.权杖}`);
console.log(`- 圣杯：${summary.suitCounts.圣杯}`);
console.log(`- 宝剑：${summary.suitCounts.宝剑}`);
console.log(`- 星币：${summary.suitCounts.星币}`);
console.log(`- 内置牌阵：${summary.templateCount}`);
console.log(`- 正义cardId：${summary.justiceCardId}`);
console.log(`- 力量cardId：${summary.strengthCardId}`);
console.log("- 案例自动标题规则：通过");
console.log("- 旧问题分类兼容规则：通过");
console.log("- 旧个人牌意兼容规则：通过");
console.log("- 新版个人牌意主题结构：通过");
console.log("- 案例状态自动计算规则：通过");
console.log("- 案例编辑保留、背景与更新规则：通过");
console.log("- 旧案例背景、收藏等可选字段兼容规则：通过");
console.log("- 案例列表排序规则：通过");
