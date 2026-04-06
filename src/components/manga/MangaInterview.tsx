// src/components/manga/MangaInterview.tsx
'use client';

import React, { useState } from 'react';
import { CharacterSVG } from './CharacterSVG';
import { SpeechBubble } from './SpeechBubble';
import { MangaGrid, MangaPanel, SFXBackground, NarrationBox, ResultStamp } from './MangaPanel';
import {
  CHARACTERS,
  CharacterMood,
  getStampByScore,
  getStampLabel,
  getCharacterByCategory,
  QuestionCategory,
} from './manga-design-system';

// ── 开场画面 ──────────────────────────────────────────────
export function MangaOpening({
  characterId = 'tanaka',
  companyName,
  role,
  questionCount,
  onStart,
}: {
  characterId?: string;
  companyName: string;
  role: string;
  questionCount: number;
  onStart: () => void;
}) {
  const char = CHARACTERS[characterId] ?? CHARACTERS.tanaka;
  const greeting = char.greetings[Math.floor(Math.random() * char.greetings.length)];

  return (
    <div>
      {/* 公司标题栏 */}
      <div style={{
        background: '#2D5BE3', color: '#fff',
        textAlign: 'center', padding: '10px 16px',
        fontSize: 13, fontWeight: 500, letterSpacing: 0.5,
      }}>
        {companyName} — {role}
      </div>

      <MangaGrid>
        {/* 暗色开场格 */}
        <MangaPanel span="full" style={{ background: '#1A1A2E', minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#F0C93A', letterSpacing: 1 }}>naitei.</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 3 }}>内定まで、一緒に。</div>
          </div>
          <SFXBackground text="START" color="#fff" />
        </MangaPanel>

        {/* 角色格 */}
        <MangaPanel style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, padding: 12 }}>
          <CharacterSVG character={char} mood="neutral" size="md" />
          <div style={{ fontSize: 10, color: '#555', textAlign: 'center', marginTop: 4 }}>{char.name}</div>
          <span style={{ fontSize: 9, background: '#E8EEFF', color: '#2D5BE3', padding: '2px 8px', borderRadius: 10 }}>
            {char.personality}
          </span>
        </MangaPanel>

        {/* 台词格 */}
        <MangaPanel style={{ display: 'flex', alignItems: 'center', padding: 12 }}>
          <SpeechBubble type="speech" direction="left">
            {greeting}
          </SpeechBubble>
        </MangaPanel>
      </MangaGrid>

      <NarrationBox>第1話「面接室に入る」— 問題数: {questionCount}</NarrationBox>

      <div style={{ display: 'flex', gap: 8, padding: '8px 12px 16px' }}>
        <button
          onClick={onStart}
          style={{
            flex: 1, background: '#2D5BE3', color: '#fff',
            border: 'none', borderRadius: 8, padding: '10px 0',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          面接スタート →
        </button>
      </div>
    </div>
  );
}

// ── 面试中画面 ────────────────────────────────────────────
export function MangaQuestion({
  characterId,
  category,
  question,
  questionTag,
  currentIndex,
  total,
  onSubmit,
}: {
  characterId?: string;
  category?: QuestionCategory;   // 问题类别，自动决定使用哪个角色
  question: string;
  questionTag?: string;
  currentIndex: number;
  total: number;
  onSubmit: (answer: string) => void;
}) {
  const [answer, setAnswer] = useState('');
  // 优先用显式传入的 characterId，否则根据 category 自动匹配
  const resolvedId = characterId ?? (category ? getCharacterByCategory(category) : 'tanaka');
  const char = CHARACTERS[resolvedId] ?? CHARACTERS.tanaka;

  return (
    <div>
      <div style={{
        background: '#2D5BE3', color: '#fff',
        textAlign: 'center', padding: '8px 16px',
        fontSize: 12, fontWeight: 500,
      }}>
        Q{currentIndex + 1} / {total}
      </div>

      <MangaGrid>
        {/* 问题格（宽格） */}
        <MangaPanel span="full" style={{ minHeight: 140 }}>
          <SFXBackground text="!?" />
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: 14 }}>
            <div style={{ flexShrink: 0 }}>
              <CharacterSVG character={char} mood="strict" size="sm" />
              <div style={{ fontSize: 9, color: '#555', textAlign: 'center', marginTop: 2 }}>{char.name}</div>
            </div>
            <SpeechBubble type="speech" direction="left" tag={questionTag}>
              {question}
            </SpeechBubble>
          </div>
        </MangaPanel>

        {/* 用户格 */}
        <MangaPanel span="full" style={{ minHeight: 60, display: 'flex', alignItems: 'center', padding: '8px 14px' }}>
          <SFXBackground text="…" color="#888" />
          <div style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>（考え中...）</div>
        </MangaPanel>
      </MangaGrid>

      {/* 答题区 */}
      <div style={{ padding: '10px 12px 14px' }}>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="ここに回答を入力してください..."
          style={{
            width: '100%', border: '2px solid #1A1A1A', borderRadius: 8,
            padding: '10px 12px', fontSize: 13, resize: 'none', height: 80,
            fontFamily: 'inherit', lineHeight: 1.6, background: '#fff', color: '#1A1A1A',
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={{
            background: '#fff', border: '1.5px solid #ccc', borderRadius: 8,
            padding: '8px 14px', fontSize: 12, cursor: 'pointer', color: '#444',
          }}>
            ヒント
          </button>
          <button
            onClick={() => answer.trim() && onSubmit(answer)}
            disabled={!answer.trim()}
            style={{
              flex: 1, background: answer.trim() ? '#2D5BE3' : '#ccc',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '8px 0', fontSize: 13, fontWeight: 500,
              cursor: answer.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            回答する →
          </button>
        </div>

        {/* 进度点 */}
        <div style={{ display: 'flex', gap: 5, justifyContent: 'center', marginTop: 12 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: i <= currentIndex ? '#2D5BE3' : '#DDD',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 结果画面 ──────────────────────────────────────────────
export function MangaResult({
  characterId = 'tanaka',
  score,
  breakdown,
  comment,
  onNext,
  onReport,
}: {
  characterId?: string;
  score: number;
  breakdown: { technical: number; logic: number; expression: number };
  comment: string;
  onNext: () => void;
  onReport: () => void;
}) {
  const char = CHARACTERS[characterId] ?? CHARACTERS.tanaka;
  const stampVariant = getStampByScore(score);
  const stampLabel = getStampLabel(score);
  const mood: CharacterMood = score >= 85 ? 'pleased' : score >= 65 ? 'neutral' : 'disappointed';

  const scoreRows = [
    { label: '技術力', value: breakdown.technical, color: '#2D5BE3' },
    { label: '論理性', value: breakdown.logic,     color: '#C89B00' },
    { label: '表現力', value: breakdown.expression, color: '#D85A30' },
  ];

  return (
    <div>
      <div style={{
        background: '#2D5BE3', color: '#fff',
        textAlign: 'center', padding: '8px 16px',
        fontSize: 12, fontWeight: 500,
      }}>
        面接結果
      </div>

      <MangaGrid>
        {/* 印章格 */}
        <MangaPanel span="full" style={{ textAlign: 'center', padding: '16px 12px 12px' }}>
          <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>総合評価</div>
          <ResultStamp label={stampLabel} variant={stampVariant} />
          <div style={{ fontSize: 12, color: '#555', marginTop: 10 }}>スコア: {score} / 100</div>
        </MangaPanel>

        {/* 角色格 */}
        <MangaPanel style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 10 }}>
          <CharacterSVG character={char} mood={mood} size="sm" />
          <div style={{ fontSize: 9, color: '#555', marginTop: 4 }}>{char.name}</div>
        </MangaPanel>

        {/* 结尾台词格 */}
        <MangaPanel style={{ display: 'flex', alignItems: 'center', padding: 10 }}>
          <SpeechBubble type="speech" direction="left" style={{ fontSize: 11 } as React.CSSProperties}>
            {comment || char.reactions[mood][0]}
          </SpeechBubble>
        </MangaPanel>
      </MangaGrid>

      {/* 分数条 */}
      <div style={{
        margin: '8px 12px',
        background: '#fff',
        border: '1.5px solid #1A1A1A',
        borderRadius: 8,
        padding: '10px 14px',
      }}>
        <div style={{ fontSize: 10, color: '#888', marginBottom: 8 }}>スコア内訳</div>
        {scoreRows.map(row => (
          <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: '#333', width: 44, flexShrink: 0 }}>{row.label}</div>
            <div style={{ flex: 1, height: 6, background: '#EEE', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${row.value}%`, height: 6, background: row.color, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: row.color, width: 28, textAlign: 'right' }}>{row.value}</div>
          </div>
        ))}
      </div>

      {/* 旁白评语 */}
      <NarrationBox>旁白：「{comment}」</NarrationBox>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 8, padding: '4px 12px 16px' }}>
        <button onClick={onReport} style={{
          background: '#fff', border: '1.5px solid #ccc', borderRadius: 8,
          padding: '9px 12px', fontSize: 12, cursor: 'pointer', color: '#444',
        }}>
          詳細レポート
        </button>
        <button onClick={onNext} style={{
          flex: 1, background: '#2D5BE3', color: '#fff', border: 'none',
          borderRadius: 8, padding: '9px 0', fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>
          次の練習へ →
        </button>
      </div>
    </div>
  );
}
