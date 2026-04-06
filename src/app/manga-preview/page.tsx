// src/app/manga-preview/page.tsx
'use client';

import React, { useState } from 'react';
import { CharacterSVG } from '@/components/manga/CharacterSVG';
import { CharacterRoster } from '@/components/manga/CharacterRoster';
import { MangaOpening, MangaQuestion, MangaResult } from '@/components/manga/MangaInterview';
import { CHARACTERS } from '@/components/manga/manga-design-system';

type Stage = 'roster' | 'opening' | 'question' | 'result';

const DEMO_QUESTIONS = [
  { category: 'technical'  as const, text: 'JavaのGCの仕組みを説明してください。' },
  { category: 'motivation' as const, text: '当社を志望した理由を教えてください。' },
  { category: 'process'    as const, text: 'スプリントの計画はどう進めますか？' },
  { category: 'governance' as const, text: 'プロジェクトのリスク管理手法を教えてください。' },
  { category: 'teamwork'   as const, text: 'チームの意見が対立した時どう対処しますか？' },
];

export default function MangaPreviewPage() {
  const [stage, setStage]   = useState<Stage>('roster');
  const [qIndex, setQIndex] = useState(0);

  const currentQ = DEMO_QUESTIONS[qIndex];

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>

      {/* ── タブ ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['roster','opening','question','result'] as Stage[]).map(s => (
          <button key={s} onClick={() => setStage(s)} style={{
            flex: 1, padding: '6px 0', fontSize: 11,
            background: stage === s ? '#2D5BE3' : '#eee',
            color: stage === s ? '#fff' : '#555',
            border: 'none', borderRadius: 6, cursor: 'pointer',
          }}>
            {s === 'roster' ? '面接官一覧' : s === 'opening' ? '開場' : s === 'question' ? '質問' : '結果'}
          </button>
        ))}
      </div>

      {/* ── 面接官一覧 ── */}
      {stage === 'roster' && (
        <div style={{ border: '1px solid #ddd', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#2D5BE3', color: '#fff', padding: '10px 16px', fontSize: 13, fontWeight: 500 }}>
            Yahoo Japan — 面接官チーム
          </div>
          <CharacterRoster characterIds={['tanaka','yamamoto','sato','nakamura','kobayashi','suzuki']} />
          <div style={{ padding: '0 12px 16px' }}>
            <button onClick={() => setStage('opening')} style={{
              width: '100%', background: '#2D5BE3', color: '#fff',
              border: 'none', borderRadius: 8, padding: '10px 0',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              面接を始める →
            </button>
          </div>
        </div>
      )}

      {/* ── 開場 ── */}
      {stage === 'opening' && (
        <div style={{ border: '1px solid #ddd', borderRadius: 16, overflow: 'hidden' }}>
          <MangaOpening
            characterId="tanaka"
            companyName="Yahoo Japan"
            role="バックエンドエンジニア"
            questionCount={5}
            onStart={() => setStage('question')}
          />
        </div>
      )}

      {/* ── 質問（角色自动切换） ── */}
      {stage === 'question' && (
        <div style={{ border: '1px solid #ddd', borderRadius: 16, overflow: 'hidden' }}>
          <MangaQuestion
            category={currentQ.category}
            question={currentQ.text}
            questionTag={currentQ.category}
            currentIndex={qIndex}
            total={DEMO_QUESTIONS.length}
            onSubmit={() => {
              if (qIndex < DEMO_QUESTIONS.length - 1) {
                setQIndex(qIndex + 1);
              } else {
                setStage('result');
              }
            }}
          />
        </div>
      )}

      {/* ── 結果 ── */}
      {stage === 'result' && (
        <div style={{ border: '1px solid #ddd', borderRadius: 16, overflow: 'hidden' }}>
          <MangaResult
            characterId="tanaka"
            score={78}
            breakdown={{ technical: 80, logic: 74, expression: 68 }}
            comment="GCの基礎は良かったです。チューニング経験をもっと具体的に。"
            onNext={() => { setQIndex(0); setStage('roster'); }}
            onReport={() => alert('詳細レポートページへ')}
          />
        </div>
      )}

      {/* ── 全角色速览 ── */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 12, letterSpacing: 1 }}>
          ALL CHARACTERS — 全表情プレビュー
        </div>
        {Object.values(CHARACTERS).map(char => (
          <div key={char.id} style={{
            display: 'flex', gap: 8, alignItems: 'center',
            padding: '8px 0', borderBottom: '0.5px solid #eee',
          }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {(['neutral','pleased','strict','surprised','thinking','disappointed'] as const).map(mood => (
                <CharacterSVG key={mood} character={char} mood={mood} size="sm" />
              ))}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{char.name}</div>
              <div style={{ fontSize: 10, color: '#888' }}>{char.role}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
