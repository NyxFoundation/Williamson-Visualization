export type Params = { uncertainty: number; smallNumbers: number; assetSpecificity: number; frequency: number; boundedRationality: number; opportunism: number };
export type ParamKey = keyof Params;
export const labels: Record<ParamKey, string> = { uncertainty: '不確実性', smallNumbers: '少数性', assetSpecificity: '資産特殊性', frequency: '取引頻度', boundedRationality: '限定合理性', opportunism: '機会主義' };
export const initial: Params = { uncertainty: 55, smallNumbers: 50, assetSpecificity: 65, frequency: 75, boundedRationality: 65, opportunism: 40 };
export type Scores = { marketScore: number; hybridScore: number; hierarchyScore: number };
export type ScoreKey = keyof Scores;
export const scoreKeys: ScoreKey[] = ['marketScore', 'hybridScore', 'hierarchyScore'];
export const scoreNames: Record<ScoreKey, string> = { marketScore: '市場', hybridScore: 'ハイブリッド', hierarchyScore: 'ヒエラルキー' };
export const colors: Record<ScoreKey, string> = { marketScore: '#23886d', hybridScore: '#d89822', hierarchyScore: '#d86659' };
export type Rule = { name: string; strength: number; effect: [number, number, number]; reason: string };
const clamp = (n: number) => Math.min(100, Math.max(0, n));
export function calculate(p: Params) {
  const u = p.uncertainty / 100, s = p.smallNumbers / 100, a = p.assetSpecificity / 100, f = p.frequency / 100, b = p.boundedRationality / 100, o = p.opportunism / 100;
  const middleU = Math.exp(-Math.pow((u - .5) / .29, 2));
  const rules: Rule[] = [];
  function rule(name: string, strength: number, weights: [number, number, number], reason: string) { rules.push({ name, strength, effect: weights.map(w => w * strength) as Rule['effect'], reason }); }
  rule('少数性 × 機会主義', s * o, [-24, 5, 28], '相手の選択肢が少なく機会主義も強いため、市場での交渉リスクが増え、組織内での調整が有力になります。');
  rule('不確実性 × 限定合理性', u * b, [-22, 30, 5], '将来を完全に契約へ書ききれず、不完備契約になります。再交渉や適応を支えるハイブリッドの便益が高まります。');
  rule('資産特殊性 × 中程度の不確実性', a * middleU * (1 - .35 * o), [-10, 42, 0], '専用投資と中程度の不確実性が、長期契約や双務的ガバナンスを後押しします。この保護の便益は機会主義が強いほど弱まります。');
  rule('資産特殊性 × 機会主義', a * o, [-28, 7, 56], '他の用途へ転用しにくい投資が交渉上の弱みとなり、ホールドアップ／ロックインへの対策として垂直統合の適合度が高まります。');
  rule('限定合理性 × 機会主義 × 資産特殊性', b * o * a, [-15, 10, 20], '契約の限界・機会主義・専用投資が重なり、単純市場よりも継続的な保護と調整が必要になります。');
  rule('不確実性 × 少数性', u * s, [-18, 5, 8], '状況が変化しても取引相手を替えにくく、市場での対応が難しくなります。');
  rule('不確実性 × 資産特殊性', u * a, [-10, 3, 12], '専用投資を伴う取引に変化が起こるため、事後的な調整の重要性が増します。');
  rule('取引頻度', f, [-3, 12, 10], '取引を繰り返すほど、継続的なガバナンスを設ける費用を回収しやすくなります。');
  const base: [number, number, number] = [88, 18, 8];
  const raw = base.map((n, index) => n + rules.reduce((sum, r) => sum + r.effect[index], 0));
  const scores: Scores = { marketScore: clamp(raw[0]), hybridScore: clamp(raw[1]), hierarchyScore: clamp(raw[2]) };
  const ranked = [...scoreKeys].sort((x, y) => scores[y] - scores[x]);
  // All three scores enter the weighted centroid; squaring improves visual separation.
  const weights = scoreKeys.map(k => scores[k] ** 2);
  const position = 100 * (weights[1] * .5 + weights[2]) / (weights.reduce((x, y) => x + y, 0) || 1);
  const strongest = [...rules].sort((x, y) => Math.max(...y.effect.map(Math.abs)) - Math.max(...x.effect.map(Math.abs)));
  const forms: { name: string; family: ScoreKey; affinity: number; description: string }[] = [
    { name: '単発取引', family: 'marketScore', affinity: 1 - f, description: '専用の調整機構を設けず、取引ごとに完結する。' },
    { name: '市場取引', family: 'marketScore', affinity: 1 - a, description: '価格と取引先の選択を通じて調整する。' },
    { name: '反復的短期契約', family: 'marketScore', affinity: f, description: '短期の契約を繰り返し、選択の柔軟性を保つ。' },
    { name: '長期契約', family: 'hybridScore', affinity: a * middleU + .2 * f, description: '継続期間と条件を定め、専用投資を保護する。' },
    { name: '長期継続取引', family: 'hybridScore', affinity: f * (1 - o) + .15, description: '取引の継続を通じて知識と信頼を蓄積する。' },
    { name: '関係的契約', family: 'hybridScore', affinity: (1 - o) * f + .35 * u * b, description: '細かな規定を補う信頼と柔軟な再調整を重視する。' },
    { name: '双務的ガバナンス', family: 'hybridScore', affinity: a * middleU + .3 * s, description: '独立性を保つ双方が、共同で調整する。' },
    { name: '双方独占間取引', family: 'hybridScore', affinity: s * a, description: '代替相手の少ない双方が、継続的に交渉する。' },
    { name: 'ネットワーク', family: 'hybridScore', affinity: f * (1 - s), description: '独立した複数主体が連携し、資源を調整する。' },
    { name: '中間組織', family: 'hybridScore', affinity: .25 + f * .25, description: '市場と組織の間に共同調整の仕組みを設ける。' },
    { name: 'フランチャイジング', family: 'hybridScore', affinity: .2 + f * (1 - a) * .35, description: '独立事業者が共通の標準と契約の下で運営する。' },
    { name: '規制', family: 'hybridScore', affinity: s * o * .65, description: '外部ルールによって取引条件や行動を制約する。' },
    { name: '内部組織', family: 'hierarchyScore', affinity: .4 + b * u * .3, description: '取引を組織内に置き、管理で調整する。' },
    { name: '企業組織', family: 'hierarchyScore', affinity: .3 + f * .4, description: '持続的な組織を設け、資源配分を統括する。' },
    { name: '垂直統合', family: 'hierarchyScore', affinity: a * o + .3 * a, description: '取引の前後工程を同じ企業に収め、投資を守る。' },
    { name: '企業内命令系統', family: 'hierarchyScore', affinity: u * o + .2 * b, description: '権限と指揮命令によって変化へ対応する。' },
  ].map(form => ({ ...form, family: form.family as ScoreKey }));
  const candidates = forms.map(form => ({ ...form, fit: scores[form.family] * (.76 + .24 * Math.min(1, form.affinity)) })).sort((x, y) => y.fit - x.fit).slice(0, 3);
  return { scores, position, ranked, rules, strongest, candidates, raw, base, institutionalStrength: .8 * Math.max(a * o, u * b, u * s) + .2 * f, individualStrength: .8 * Math.max(a * o, u * b, s * o) + .1 * b + .1 * o };
}
export const glossary: Record<string, string> = {
  不確実性: '将来の環境や取引結果を予測しにくい程度。高いほど契約後の調整が必要になります。',
  少数性: '代替可能な取引相手が少ない程度。100は相手の選択肢が非常に限られる状態です。',
  資産特殊性: '特定の取引相手・用途に投資が結びつき、他へ転用すると価値が下がる程度。',
  取引頻度: '同じ種類の取引を繰り返す程度。高いほど継続的な仕組みの費用を回収しやすくなります。',
  限定合理性: '認知・計算・情報処理には限界があること。このモデルの高い値は、その制約が強い状態です。',
  機会主義: '情報や交渉上の優位を利用し、約束の趣旨に反して自己利益を追求する傾向。',
  市場: '独立した主体が価格と競争を通じて取引を調整する仕組み。',
  ハイブリッド: '主体の独立性を保ちつつ、長期契約や共同調整を用いる中間的な仕組み。',
  ヒエラルキー: '取引を組織内に取り込み、権限や管理を通じて調整する仕組み。',
  長期契約: '一定期間の継続取引と条件を定め、投資と関係を保護する契約。',
  関係的契約: '明文化した条件に加え、信頼・慣行・継続の期待によって運用される契約。',
  双務的ガバナンス: '独立した二者が関係を維持しながら、共同で適応・紛争解決を行う仕組み。',
  垂直統合: '供給・生産・販売などの前後工程を同じ企業の所有・管理の下に置くこと。',
  'シフト・パラメーター': '制度的環境がガバナンス間の比較費用を変える経路。ここでは取引属性も同じ操作領域にまとめています。',
  戦略的: '組織が制度やルールの形成へ働きかける二次的な経路。このアプリでは概念表示です。',
  内生的選好: '所属する組織や経験により、個人の選好・行動が変化する経路。ここでは概念表示です。',
};
