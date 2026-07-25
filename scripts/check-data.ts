import { validateDataIntegrity } from "../src/data/dataIntegrity";

const summary = validateDataIntegrity();

console.log("数据完整性检查通过");
console.log(`- 塔罗牌总数：${summary.cardCount}`);
console.log(`- 大阿尔卡那：${summary.majorArcanaCount}`);
console.log(`- 权杖：${summary.suitCounts.权杖}`);
console.log(`- 圣杯：${summary.suitCounts.圣杯}`);
console.log(`- 宝剑：${summary.suitCounts.宝剑}`);
console.log(`- 星币：${summary.suitCounts.星币}`);
console.log(`- 内置牌阵：${summary.templateCount}`);
console.log(`- 正义cardId：${summary.justiceCardId}`);
console.log(`- 力量cardId：${summary.strengthCardId}`);
