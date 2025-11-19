import { ArticleCandidate } from '../../models/article_candidate';

export type QualityGateResult = {
  passed: boolean;
  score: number;
  issues: string[];
};

const numericPattern = /([0-9]+(?:\.[0-9]+)?)/g;

export function evaluateCandidate(candidate: ArticleCandidate): QualityGateResult {
  const issues: string[] = [];
  const scoreComponents: number[] = [];

  // 100〜150字の要約制約（ざっくりチェック）
  const length = candidate.summary_draft.length;
  if (length < 100 || length > 150) {
    issues.push('要約文字数が100〜150字を満たしていません');
    scoreComponents.push(0.6);
  } else {
    scoreComponents.push(0.9);
  }

  // 数字の整合性 (タイトル内の数値と要約内の数値が一致しているかざっくり比較)
  const titleNumbers: string[] = candidate.title.match(numericPattern) ?? [];
  const summaryNumbers: string[] =
    candidate.summary_draft.match(numericPattern) ?? [];
  const numberMismatch = titleNumbers.some((num) => !summaryNumbers.includes(num));
  if (numberMismatch) {
    issues.push('タイトルと要約の数値が一致しません');
    scoreComponents.push(0.5);
  } else {
    scoreComponents.push(0.9);
  }

  // タグ数
  if (!candidate.tags?.length) {
    issues.push('タグが付与されていません');
    scoreComponents.push(0.4);
  } else {
    scoreComponents.push(0.8);
  }

  const score = scoreComponents.reduce((sum, value) => sum + value, 0) / scoreComponents.length;
  const passed = score >= 0.75;

  return { passed, score, issues };
}
