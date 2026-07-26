import type { CaseStatus } from "../types/tarot";

/** 根据反馈与复盘内容自动判断案例状态。 */
export function calculateCaseStatus(
  followUp?: string,
  reviewNotes?: string,
): CaseStatus {
  if (reviewNotes?.trim()) {
    return "已复盘";
  }

  if (followUp?.trim()) {
    return "已反馈";
  }

  return "待反馈";
}
