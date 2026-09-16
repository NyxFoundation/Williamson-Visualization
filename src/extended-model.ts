import { calculate, initial } from './model';
import type { Params } from './model';

export type ExtendedParams = Params & { codifiability: number; verifiability: number; mtMechanism: boolean };
export type ExtendedParamKey = Exclude<keyof ExtendedParams, 'mtMechanism'>;
export type ExtendedScoreKey = 'marketScore' | 'hybridScore' | 'hierarchyScore' | 'blockchainScore';
export type ExtendedRule = { name: string; strength: number; effect: number; reason: string };

export const extendedInitial: ExtendedParams = { ...initial, codifiability: 100, verifiability: 100, mtMechanism: false };
export const extendedLabels: Record<ExtendedParamKey, string> = {
  uncertainty: '不確実性',
  smallNumbers: '少数性',
  assetSpecificity: '資産特殊性',
  frequency: '取引頻度',
  codifiability: 'Codifiability',
  verifiability: 'Verifiability',
  boundedRationality: '限定合理性',
  opportunism: '機会主義',
};
export const extendedScoreKeys: ExtendedScoreKey[] = ['marketScore', 'hybridScore', 'hierarchyScore', 'blockchainScore'];
export const extendedScoreNames: Record<ExtendedScoreKey, string> = {
  marketScore: '市場', hybridScore: 'ハイブリッド', hierarchyScore: 'ヒエラルキー', blockchainScore: 'ブロックチェーン',
};
export const extendedColors: Record<ExtendedScoreKey, string> = {
  marketScore: '#23886d', hybridScore: '#d89822', hierarchyScore: '#d86659', blockchainScore: '#7357c8',
};

const clamp = (n: number) => Math.min(100, Math.max(0, n));

export function calculateExtended(p: ExtendedParams) {
  const traditional = calculate(p);
  const u = p.uncertainty / 100;
  const s = p.smallNumbers / 100;
  const a = p.assetSpecificity / 100;
  const f = p.frequency / 100;
  const b = p.boundedRationality / 100;
  const o = p.opportunism / 100;
  const c = p.codifiability / 100;
  const v = p.verifiability / 100;
  const mt = p.mtMechanism ? 1 : 0;
  const rules: ExtendedRule[] = [];
  const add = (name: string, strength: number, weight: number, reason: string) => rules.push({ name, strength, effect: strength * weight, reason });

  add('Codifiability', c, 25, '要件を機械可読なルールへ精密に落とし込めるほど、設計費用を抑えやすくなります。');
  add('Verifiability', v, 25, '履行や品質を事後に観察できるほど、記録・監視・自動執行が機能しやすくなります。');
  add('Codifiability × Verifiability', c * v, 38, '要件と結果の両方が明示的なら、コードによる自律的な調整と執行を一貫して行えます。');
  add('反復取引 × 明示性', f * c * v, 10, '明示的な取引を繰り返すほど、仕組みの導入費用を回収しやすくなります。');
  add('資産特殊性 × Digital governability', a * o * c * v, 22, '専用投資が生むホールドアップ・リスクを、検証可能な記録とコードによる執行で保護します。');
  add('少数性 × 機会主義 × 検証可能性', s * o * v, 10, '相手が限られ行動リスクがあっても、検証可能な記録は監視と執行を補助します。');
  add('Low codifiability × 不確実性', (1 - c) * (.5 + .5 * u), -18, '予測しにくい取引を事前にコードへ書き切れないと、設計と変更の費用が増えます。');
  add('Low verifiability × 機会主義', (1 - v) * (.5 + .5 * o), -22, '外部情報を確かめにくいほど、誤った入力で自動執行されるオラクル問題が残ります。');
  add('限定合理性 × Low codifiability', b * (1 - c), -10, '認知の限界が強く要件も暗黙的な場合、例外を完全なコードにすることは困難です。');
  add('M&Tメカニズム', mt, 120, 'Codifiabilityが低い取引でも、M&Tメカニズムがコード化の制約を補完し、ブロックチェーン統治の効用を高めます。');

  const digitalGovernability = Math.max(c * v, mt);
  const assetSpecificityPressure = 56 * a * o + 20 * b * o * a + 12 * u * a;
  const hierarchyRelief = Math.min(traditional.scores.hierarchyScore, assetSpecificityPressure * digitalGovernability * .72);
  const blockchainRaw = 8 + rules.reduce((sum, rule) => sum + rule.effect, 0);
  const scores = {
    marketScore: traditional.scores.marketScore,
    hybridScore: traditional.scores.hybridScore,
    hierarchyScore: clamp(traditional.scores.hierarchyScore - hierarchyRelief),
    blockchainScore: clamp(blockchainRaw),
  };
  const ranked = [...extendedScoreKeys].sort((x, y) => scores[y] - scores[x]);
  const strongest = [...rules].sort((x, y) => Math.abs(y.effect) - Math.abs(x.effect));
  const explicitness = digitalGovernability;
  const transactionType = c >= .6 && v >= .6 ? '明示的取引' : c < .4 && v < .4 ? '暗黙的取引' : '混合的取引';

  return { scores, ranked, rules, strongest, blockchainRaw, explicitness, digitalGovernability, assetSpecificityPressure, hierarchyRelief, transactionType, traditional };
}
