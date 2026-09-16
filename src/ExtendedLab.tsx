import React, { useRef, useState } from 'react';
import {
  calculateExtended, extendedColors, extendedInitial, extendedLabels, extendedScoreKeys, extendedScoreNames,
} from './extended-model';
import type { ExtendedParamKey, ExtendedParams } from './extended-model';

const fmt = (n: number) => Math.round(n);

export function ExtendedLab() {
  const [params, setParams] = useState<ExtendedParams>({ ...extendedInitial });
  const [before, setBefore] = useState<ExtendedParams | null>(null);
  const gesture = useRef(false);
  const result = calculateExtended(params);
  const previous = before ? calculateExtended(before) : null;
  const winner = result.ranked[0];
  const governanceWeights = extendedScoreKeys.map(key => result.scores[key] ** 2);
  const governancePosition = 100 * governanceWeights.reduce((sum, weight, index) => sum + weight * index / 3, 0) / (governanceWeights.reduce((sum, weight) => sum + weight, 0) || 1);

  function begin() {
    if (!gesture.current) setBefore({ ...params });
    gesture.current = true;
  }
  function change(key: ExtendedParamKey, value: number) {
    if (!gesture.current) setBefore({ ...params });
    setParams(current => ({ ...current, [key]: value }));
  }
  function toggleMtMechanism() {
    setBefore({ ...params });
    setParams(current => ({ ...current, mtMechanism: !current.mtMechanism }));
    gesture.current = false;
  }
  function slider(key: ExtendedParamKey, tone: 'blue' | 'green' | 'purple' = 'blue') {
    const id = `ext-${key}`;
    return <div className={`control ext-control ${tone}`} key={key}>
      <div className="control-label"><label htmlFor={id}>{extendedLabels[key]}</label><output htmlFor={id}>{params[key]}</output></div>
      <input id={id} type="range" min="0" max="100" value={params[key]} style={{ '--fill': `${params[key]}%` } as React.CSSProperties}
        onPointerDown={begin} onPointerUp={() => { gesture.current = false; }} onPointerCancel={() => { gesture.current = false; }}
        onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) begin(); }}
        onKeyUp={() => { gesture.current = false; }} onBlur={() => { gesture.current = false; }} onChange={event => change(key, Number(event.target.value))} />
      <div className="range-label"><span>低い</span><span>高い</span></div>
    </div>;
  }

  const blockchainDelta = previous ? fmt(result.scores.blockchainScore) - fmt(previous.scores.blockchainScore) : null;
  return <section className="extended-lab" aria-labelledby="extended-title">
    <div className="extended-intro">
      <div><div className="eyebrow purple-copy">BLOCKCHAIN GOVERNANCE EXTENSION · LUMINEAU ET AL.</div><h2 id="extended-title">明示できる取引は、コードで統治できるか。</h2><p>制度的環境・取引属性に Codifiability と Verifiability を含め、ブロックチェーンを第4のガバナンス候補として比較します。</p></div>
      <button className="reset" aria-label="拡張版をリセット" onClick={() => { setBefore({ ...params }); setParams({ ...extendedInitial }); gesture.current = false; }}>↺ <span>拡張版を初期状態に戻す</span></button>
    </div>

    <div className="extended-workspace">
      <aside className="panel ext-controls">
        <div className="panel-heading"><h2><span className="step">A1</span> 条件を設定</h2><span className="tiny">0 — 100</span></div>
        <div className="controls-body">
          <div className="section-label blue"><span>▤</span> 制度的環境・取引属性</div>
          <p className="small-note">取引を取り巻く条件を変える</p>
          {(['uncertainty', 'smallNumbers', 'assetSpecificity', 'frequency', 'codifiability', 'verifiability'] as ExtendedParamKey[]).map(k => slider(k))}
          <div className={`mt-switch-control ${params.mtMechanism ? 'enabled' : ''}`}>
            <div><strong>M&amp;Tスイッチ</strong><small>低Codifiabilityを補完するメカニズム</small></div>
            <button type="button" role="switch" aria-label="M&Tスイッチ" aria-checked={params.mtMechanism} onClick={toggleMtMechanism}><span/>{params.mtMechanism ? 'ON' : 'OFF'}</button>
          </div>
          <div className="section-label green-text individual-heading"><span>♙</span> 個人・行動属性</div>
          {(['boundedRationality', 'opportunism'] as ExtendedParamKey[]).map(k => slider(k, 'green'))}
        </div>
      </aside>

      <section className="ext-center-column">
        <div className="panel ext-structure-panel">
          <div className="panel-heading"><h2><span className="step">A2</span> ガバナンスの4層構造</h2><span className="live-badge purple-live"><span className="live-dot"/> LIVE</span></div>
          <div className="diagram ext-diagram">
            <svg className="causal-svg" viewBox="0 0 600 610" preserveAspectRatio="none" aria-label="制度的環境と個人から4つのガバナンスへの効果を表す因果図" role="img">
              <defs><marker id="ext-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9 z" fill="#5283c1"/></marker><marker id="ext-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9 z" fill="#399881"/></marker></defs>
              <path d="M300 148 L300 258" fill="none" stroke="#5283c1" strokeWidth={2 + result.traditional.institutionalStrength * 7} opacity={.35 + .65 * result.traditional.institutionalStrength} markerEnd="url(#ext-arrow-blue)"/>
              <path d="M300 545 L300 443" fill="none" stroke="#399881" strokeWidth={2 + result.traditional.individualStrength * 7} opacity={.35 + .65 * result.traditional.individualStrength} markerEnd="url(#ext-arrow-green)"/>
            </svg>
            <div className="layer environment ext-environment"><div className="layer-title"><span className="layer-symbol">▤</span><strong>制度的環境・取引属性</strong><span className="layer-index">LAYER 01</span></div><p>ルール・規範と、取引を取り巻く条件</p><div className="layer-tags"><span>不確実性 <b>{params.uncertainty}</b></span><span>少数性 <b>{params.smallNumbers}</b></span><span>資産特殊性 <b>{params.assetSpecificity}</b></span><span>取引頻度 <b>{params.frequency}</b></span><span>Codifiability <b>{params.codifiability}</b></span><span>Verifiability <b>{params.verifiability}</b></span></div></div>
            <div className="ext-shift-label">シフト・パラメーター<small>ガバナンスの比較費用を変える</small></div>
            <div className="layer governance ext-governance"><div className="layer-title"><span className="layer-symbol">⇄</span><strong>ガバナンス</strong><span className="layer-index">LAYER 02</span></div><div className="spectrum-head">取引をどう調整するか<span>現在のバランス</span></div><div className="ext-spectrum"><div className="ext-spectrum-ticks"><i/><i/><i/><i/></div><span className="spectrum-marker ext-spectrum-marker" data-testid="ext-spectrum-marker" style={{ left: `${governancePosition}%` }}><span/></span></div><div className="ext-spectrum-labels">{extendedScoreKeys.map((key, index) => <span className={winner === key ? 'active' : ''} key={key} style={{ '--choice': extendedColors[key] } as React.CSSProperties}><b>{['●', '◆', '■', '⬡'][index]} {extendedScoreNames[key]}</b><small>{fmt(result.scores[key])}</small></span>)}</div></div>
            <div className="ext-behavior-label">行動属性<small>認知の限界と、自己利益の追求</small></div>
            <div className="layer individual ext-individual"><div className="layer-title"><span className="layer-symbol">♙</span><strong>個人</strong><span className="layer-index">LAYER 03</span></div><div className="layer-tags"><span>限定合理性 <b>{params.boundedRationality}</b></span><span>機会主義 <b>{params.opportunism}</b></span></div></div>
          </div>
          <div className="capability-list" aria-label="デジタル統治を可能にする4つの機能">
            <span><i>01</i> 履行条件を事前にコード化</span><span><i>02</i> 履行状況を検証</span><span><i>03</i> 支払・制裁等を自動執行</span><span><i>04</i> 改ざん困難な履歴を共有</span>
          </div>
          <p className="moderation-claim">資産特殊性だけでは選択は決まらない。取引をデジタルに統治できるほど、内部化せずに専用投資を保護できる余地が生まれます。</p>
        </div>
      </section>

      <aside className="ext-right-column">
        <div className="panel ext-results">
          <div className="panel-heading"><h2><span className="step">A3</span> 結果を読み解く</h2><span className="tiny">適合度 / 100</span></div>
          <div className="results-body ext-results-body"><div className="score-list">{extendedScoreKeys.map((key, index) => {
            const delta = previous ? fmt(result.scores[key]) - fmt(previous.scores[key]) : 0;
            return <div className={`score-row ${winner === key ? 'leading' : ''}`} key={key} style={{ '--score-color': extendedColors[key] } as React.CSSProperties}>
              <div className="score-row-top"><span className="score-name"><span className="shape">{['●', '◆', '■', '⬡'][index]}</span>{extendedScoreNames[key]}</span><span className="ext-score-value"><strong data-testid={`ext-${key}`}>{fmt(result.scores[key])}</strong>{previous && <small className={delta > 0 ? 'up' : delta < 0 ? 'down' : ''}>{delta === 0 ? '− 0' : `${delta > 0 ? '↑' : '↓'} ${Math.abs(delta)}`}</small>}</span></div>
              <div className="score-track"><div style={{ width: `${result.scores[key]}%` }}/></div>
            </div>;
          })}</div><p className="score-note">独立した適合度です。合計は100になりません。</p>
            <div className="why ext-why"><div className="eyebrow">WHY THIS RESULT?</div><h3>現在は<span style={{ color: extendedColors[winner] }}>{extendedScoreNames[winner]}</span>が<br/>最も有力です</h3>
              <ul><li>{winner === 'blockchainScore' && params.mtMechanism ? 'M&Tメカニズムが低Codifiabilityの制約を補完し、ヒエラルキーを上回るブロックチェーン統治の効用を実現しています。' : winner === 'blockchainScore' ? '要件をコード化でき、成果も検証しやすいため、コードベースの自動執行が比較優位を持ちます。' : params.codifiability < 50 && params.verifiability < 50 ? '要件と成果に暗黙性が残るため、人による判断・適応を含む従来型ガバナンスが優位です。' : 'ブロックチェーンにも適用余地がありますが、従来型ガバナンスの適合度がなお上回っています。'}</li></ul>
            </div>
            <div className="ext-delta"><span>ブロックチェーン適合度</span><strong>{fmt(result.scores.blockchainScore)}</strong>{blockchainDelta !== null && <small>{blockchainDelta === 0 ? '前回比 ±0' : `前回比 ${blockchainDelta > 0 ? '+' : ''}${blockchainDelta}`}</small>}</div>
          </div>
        </div>
      </aside>
    </div>

    <div className="ext-source"><span>MODEL SOURCE</span><p>Lumineau, Wang &amp; Schilke, “Blockchain Governance—A New Way of Organizing Collaborations?”, <i>Organization Science</i> 32(2), 500–521. 特に pp. 509–511 の codifiability / verifiability と Table 2 を反映。</p></div>
  </section>;
}
