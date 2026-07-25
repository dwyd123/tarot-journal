import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { validateDataIntegrity } from "../src/data/dataIntegrity";
import { TAROT_CARDS } from "../src/data/tarotCards";
import { normalizeStoredPersonalCardMeaning } from "../src/storage/personalCardMeaningStorage";
import { normalizeStoredCaseCategory } from "../src/storage/tarotCaseStorage";
import { generateTarotCaseTitle } from "../src/utils/createTarotCase";

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
  legacyPersonalMeaning.personalAssociations !== "个人经验"
) {
  throw new Error("旧个人牌意数据的兼容规则不正确。");
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
