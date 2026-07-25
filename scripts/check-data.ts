import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { validateDataIntegrity } from "../src/data/dataIntegrity";
import { TAROT_CARDS } from "../src/data/tarotCards";

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
