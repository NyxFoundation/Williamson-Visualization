import React, { useEffect, useId, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calculate, colors, glossary, initial, labels, scoreKeys, scoreNames } from './model';
import type { Params, ParamKey } from './model';
import './style.css';

function Help({ term }: { term: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const [position, setPosition] = useState({ left: 16, top: 16 });
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [open]);
  return <span className="help-wrap" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }} onKeyDown={e => { if (e.key === 'Escape') setOpen(false); }}><button type="button" className="help" aria-label={`${term}の説明`} aria-expanded={open} aria-controls={id} onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setPosition({ left: Math.max(16, Math.min(window.innerWidth - 236, rect.left - 100)), top: Math.max(16, Math.min(window.innerHeight - 160, rect.bottom + 8)) }); setOpen(!open); }}>?</button>{open && <span id={id} role="note" className="tooltip" style={{ position: 'fixed', left: position.left, top: position.top, right: 'auto', width: 220 }}>{glossary[term] || term}</span>}</span>;
}
const fmt = (n: number) => Math.round(n);
const signed = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}`;
function App() {
  const [params, setParams] = useState<Params>({ ...initial });
  const [before, setBefore] = useState<Params | null>(null);
  const [changeLabel, setChangeLabel] = useState('');
  const gesture = useRef(false);
  const [allRules, setAllRules] = useState(false);
  const result = calculate(params);
  const previous = before ? calculate(before) : null;
  const winner = result.ranked[0];
  function begin(key: ParamKey) { gesture.current = true; setBefore({ ...params }); setChangeLabel(labels[key]); }
  function change(key: ParamKey, value: number) { if (!gesture.current) { setBefore({ ...params }); setChangeLabel(labels[key]); } setParams(p => ({ ...p, [key]: value })); }
  function reset() { setBefore({ ...params }); setChangeLabel('初期状態に戻す'); setParams({ ...initial }); gesture.current = false; }
  function slider(key: ParamKey, green = false) {
    return <div className={`control ${green ? 'green' : ''}`} key={key}>
      <div className="control-label"><label htmlFor={key}>{labels[key]}</label><Help term={labels[key]} /><output htmlFor={key}>{params[key]}</output></div>
      <input id={key} type="range" min="0" max="100" value={params[key]} style={{ '--fill': `${params[key]}%` } as React.CSSProperties} onPointerDown={() => begin(key)} onPointerUp={() => { gesture.current = false; }} onPointerCancel={() => { gesture.current = false; }} onKeyDown={e => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key) && !gesture.current) begin(key); }} onKeyUp={() => { gesture.current = false; }} onBlur={() => { gesture.current = false; }} onChange={e => change(key, Number(e.target.value))} />
      <div className="range-label"><span>低い</span><span>高い</span></div>
    </div>;
  }
  return <>
    <header className="topbar"><div className="brand"><span className="brand-icon">↗</span><strong>TCE<span> Lab</span></strong><span className="brand-divider"/><span className="brand-caption">ガバナンスの実験室</span></div><div className="header-meta"><span className="live-dot"/> INTERACTIVE LEARNING <span className="version">v1.0</span></div></header>
    <main>
      <section className="intro"><div><div className="eyebrow">TRANSACTION COST ECONOMICS</div><h1>取引の条件が変わると、<br className="mobile-break"/> 組織のかたちも変わる。</h1><p>条件を動かして、市場・ハイブリッド・ヒエラルキーの関係を探ってみましょう。</p></div><button className="reset" onClick={reset}>↺ <span>初期状態に戻す</span></button></section>
      <div className="workspace">
        <aside className="panel controls"><div className="panel-heading"><h2><span className="step">01</span> 条件を設定</h2><span className="tiny">0 — 100</span></div><div className="controls-body"><div className="section-label blue"><span>▤</span> 制度的環境・取引属性</div><p className="small-note">取引を取り巻く条件を変える</p>{(['uncertainty', 'smallNumbers', 'assetSpecificity', 'frequency'] as ParamKey[]).map(k => slider(k))}<div className="section-label green-text individual-heading"><span>♙</span> 個人・行動属性</div>{(['boundedRationality', 'opportunism'] as ParamKey[]).map(k => slider(k, true))}<div className="control-hint">↔ スライダーを動かすと、すべてが連動します。</div></div></aside>
        <section className="center-column">
          <div className="panel diagram-panel"><div className="panel-heading"><h2><span className="step">02</span> ガバナンスの3層構造</h2><span className="live-badge"><span className="live-dot"/> LIVE</span></div>
            <div className="diagram">
              <svg className="causal-svg" viewBox="0 0 600 570" preserveAspectRatio="none" aria-label="制度的環境からガバナンスへ、個人からガバナンスへの主要効果と、二次的効果を表す因果図" role="img">
                <defs>{['blue', 'green', 'muted'].map((c, index) => <marker key={c} id={`arrow-${c}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9 z" fill={['#5283c1', '#399881', '#9ba8b6'][index]}/></marker>)}</defs>
                <path className="primary-path" data-testid="environment-arrow" d="M300 123 L300 232" fill="none" stroke="#5283c1" strokeWidth={2 + result.institutionalStrength * 7} opacity={.35 + .65 * result.institutionalStrength} markerEnd="url(#arrow-blue)"/>
                <path className="primary-path" data-testid="individual-arrow" d="M300 480 L300 386" fill="none" stroke="#399881" strokeWidth={2 + result.individualStrength * 7} opacity={.35 + .65 * result.individualStrength} markerEnd="url(#arrow-green)"/>
                <path d="M84 282 H52 Q38 282 38 268 V89 Q38 76 53 76 H107" className="secondary-path" markerEnd="url(#arrow-muted)"/>
                <path d="M515 328 H539 Q550 328 550 343 V513 Q550 527 535 527 H494" className="secondary-path" markerEnd="url(#arrow-muted)"/>
                <path d="M493 76 H566 Q580 76 580 90 V541 Q580 554 564 554 H493" className="secondary-path" markerEnd="url(#arrow-muted)"/>
              </svg>
              <div className="layer environment"><div className="layer-title"><span className="layer-symbol">▤</span><strong>制度的環境</strong><span className="layer-index">LAYER 01</span></div><p>ルール・規範と、取引を取り巻く条件</p><div className="layer-tags"><span>不確実性 <b>{params.uncertainty}</b></span><span>少数性 <b>{params.smallNumbers}</b></span><span>資産特殊性 <b>{params.assetSpecificity}</b></span></div></div>
              <div className="path-label shift">シフト・パラメーター <Help term="シフト・パラメーター"/><small>ガバナンスの比較費用を変える</small></div>
              <div className="secondary-label strategic">戦略的 <Help term="戦略的"/></div>
              <div className="layer governance"><div className="layer-title"><span className="layer-symbol">⇄</span><strong>ガバナンス</strong><span className="layer-index">LAYER 02</span></div><div className="spectrum-head">取引をどう調整するか<span>現在のバランス</span></div><div className="spectrum"><div className="spectrum-ticks"><i/><i/><i/></div><span className="spectrum-marker" data-testid="spectrum-marker" style={{ left: `${result.position}%` }}><span/></span></div><div className="spectrum-labels">{scoreKeys.map(k => <span key={k}>{scoreNames[k]}<Help term={scoreNames[k]}/></span>)}</div><div className="governance-caption">3つの適合度を反映した位置 <b>{fmt(result.position)} / 100</b></div></div>
              <div className="path-label behavior">行動属性<small>認知の限界と、自己利益の追求</small></div>
              <div className="secondary-label endogenous">内生的選好 <Help term="内生的選好"/></div><div className="secondary-label secondary-effect">二次的効果</div>
              <div className="layer individual"><div className="layer-title"><span className="layer-symbol">♙</span><strong>個人</strong><span className="layer-index">LAYER 03</span></div><div className="layer-tags"><span>限定合理性 <b>{params.boundedRationality}</b></span><span>機会主義 <b>{params.opportunism}</b></span></div></div>
            </div><div className="diagram-legend"><span><i className="solid-sample"/>主要効果（太さ＝影響の強さ）</span><span><i className="dashed-sample"/>二次的効果</span></div><p className="diagram-note">取引属性は便宜上、制度的環境の操作領域に配置。破線は概念的な経路で、入力への自動フィードバックは行いません。</p>
          </div>
        </section>
        <aside className="right-column"><div className="panel results"><div className="panel-heading"><h2><span className="step">03</span> 結果を読み解く</h2><span className="tiny">適合度 / 100</span></div><div className="results-body"><div className="score-list">{scoreKeys.map((k, i) => <div className={`score-row ${winner === k ? 'leading' : ''}`} key={k} style={{ '--score-color': colors[k] } as React.CSSProperties}><div className="score-row-top"><span className="score-name"><span className="shape">{['●', '◆', '■'][i]}</span>{scoreNames[k]}<Help term={scoreNames[k]}/></span><strong data-testid={k}>{fmt(result.scores[k])}</strong></div><div className="score-track"><div style={{ width: `${result.scores[k]}%` }}/></div></div>)}</div><p className="score-note">独立した適合度です。合計は100になりません。</p><div className="why"><div className="eyebrow">WHY THIS RESULT?</div><h3>現在は<span style={{ color: colors[winner] }}>{scoreNames[winner]}</span>が<br/>最も有力です</h3>{result.scores[winner] - result.scores[result.ranked[1]] < 8 && <p className="close-note">{scoreNames[result.ranked[1]]}も近い適合度です。複数の選択肢を比較しましょう。</p>}<ul>{result.strongest.filter(r => r.strength > .08).slice(0, 3).map(r => <li key={r.name}>{r.reason}</li>)}{params.assetSpecificity >= 55 && params.opportunism < 55 && <li>資産特殊性は高いものの、機会主義は{params.opportunism}。統合を必須とせず、長期契約や継続的な関係で投資を守る余地があります。</li>}{winner === 'marketScore' && <li>総合的な契約リスクが比較的小さく、組織化の費用を抑えられる市場の適合度が高くなっています。</li>}</ul></div><div className="candidates"><h3>具体的なガバナンス <span>TOP 3</span></h3>{result.candidates.map((c, index) => <div className="candidate" key={c.name}><span className="rank">0{index + 1}</span><div><strong>{c.name}{glossary[c.name] && <Help term={c.name}/>}</strong><p>{c.description}</p><span className="family-tag" style={{ color: colors[c.family] }}>{scoreNames[c.family]}</span></div></div>)}<p className="small-note">形態候補も教育用の例示です。業種・法制度などは別途検討が必要です。</p></div></div></div>
          <div className="panel difference"><div className="panel-heading"><h2>↔ 変更前と変更後</h2></div><div className="difference-body">{before && previous ? <><div className="difference-title">{changeLabel}</div><div className="changed-inputs">{(Object.keys(params) as ParamKey[]).filter(k => before[k] !== params[k]).map(k => <div key={k}><span>{labels[k]}</span><span>{before[k]} <span className="muted">→</span> <b>{params[k]}</b></span></div>)}</div>{scoreKeys.map(k => { const delta = fmt(result.scores[k]) - fmt(previous.scores[k]); return <div className="diff-row" key={k}><span>{scoreNames[k]}</span><span>{fmt(previous.scores[k])} <span className="muted">→</span> <b>{fmt(result.scores[k])}</b></span><span className={`delta ${delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>{delta > 0 ? '↑' : delta < 0 ? '↓' : '−'} {Math.abs(delta)}</span></div>; })}<p className="small-note">スライダーの操作開始時点と比較</p></> : <p className="empty-state">スライダーを操作すると、<br/>ここに変化が表示されます。</p>}</div></div>
        </aside>
      </div>
      <section className="panel contributions"><div className="panel-heading"><h2><span className="rule-icon">⤨</span> いま強く作用しているルール</h2><button className="text-button" onClick={() => setAllRules(!allRules)}>{allRules ? '上位4件を表示' : '全ルール・計算式を見る'} <span>{allRules ? '−' : '+'}</span></button></div><div className="rule-grid">{(allRules ? result.strongest : result.strongest.slice(0, 4)).map(r => <div className="rule-card" key={r.name}><div className="rule-card-top"><span className="rule-dot"/><span>作用の強さ {fmt(r.strength * 100)}%</span></div><h3>{r.name}</h3><div className="strength-track"><span style={{ width: `${r.strength * 100}%` }}/></div><div className="rule-values">{scoreKeys.map((k, i) => <div key={k}><span>{scoreNames[k]}</span><strong style={{ color: colors[k] }}>{signed(r.effect[i])}</strong></div>)}</div></div>)}</div>{allRules && <div className="formula"><strong>計算方法</strong><p>入力値 ÷ 100 → 相互作用を乗算 → 重みを掛けて加算。基礎点は市場88・ハイブリッド18・ヒエラルキー8。各スコアは基礎点＋全寄与を0〜100に制限します。表示寄与は制限前の値です。</p><p>中程度の不確実性 = exp(−((不確実性 / 100 − 0.5) / 0.29)²)。長期契約の相互作用の強さ = 資産特殊性 / 100 × 中程度の不確実性 × (1 − 0.35 × 機会主義 / 100)。マーカー位置 = 100 × (0.5 × hybridScore² + hierarchyScore²) / (marketScore² + hybridScore² + hierarchyScore²)。候補は各系統のスコアと形態ごとの条件適合を組み合わせて順位付けします。</p></div>}<div className="rules-footnote">各寄与はスコアへの加算ポイント。相互作用では、各入力値を0〜1に正規化して掛け合わせています。</div></section>
      <details className="glossary-panel"><summary>用語ガイド <span>概念の意味を確認する</span></summary><div className="glossary-grid">{Object.entries(glossary).map(([term]) => <span key={term}>{term}<Help term={term}/></span>)}</div></details>
      <footer><span className="footer-mark">TCE Lab</span><p>数値・重みは、取引コスト経済学の関係を操作可能にするための教育用モデルです。理論自体が数値的決定式を提示しているわけではありません。</p><a href="https://www.nobelprize.org/prizes/economics/2009/williamson/lecture/" target="_blank" rel="noreferrer">理論の参考：Williamson, Nobel Lecture ↗</a></footer>
    </main>
  </>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
