// src/components/manga/CharacterRoster.tsx
// 用于面试开始前展示"今天参与面试的考官阵容"
'use client';

import React from 'react';
import { CharacterSVG } from './CharacterSVG';
import { CHARACTERS, Character, CATEGORY_LABELS, QuestionCategory } from './manga-design-system';

interface CharacterRosterProps {
  characterIds: string[];   // 本次面试出场的角色ID列表
}

const TYPE_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  technical: { label: '技術',     bg: '#E8EEFF', color: '#2D5BE3' },
  hr:        { label: '人事・HR', bg: '#F5E8FF', color: '#7A35A0' },
  pm:        { label: 'PM',       bg: '#E8F5FF', color: '#1A6A9A' },
  pmo:       { label: 'PMO',      bg: '#F0E8FF', color: '#5A2080' },
  executive: { label: '役員',     bg: '#FFF0E8', color: '#8A3A10' },
};

export function CharacterRoster({ characterIds }: CharacterRosterProps) {
  const chars = characterIds
    .map(id => CHARACTERS[id])
    .filter(Boolean) as Character[];

  return (
    <div style={{ padding: '12px' }}>
      <div style={{
        fontSize: 10, color: '#888', letterSpacing: 1,
        textTransform: 'uppercase', marginBottom: 10,
      }}>
        本日の面接官
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(chars.length, 3)}, 1fr)`,
        gap: 8,
      }}>
        {chars.map(char => {
          const badge = TYPE_BADGE[char.type] ?? TYPE_BADGE.technical;
          return (
            <div key={char.id} style={{
              background: '#FAFAF8',
              border: '1.5px solid #1A1A1A',
              borderRadius: 8,
              padding: '10px 6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}>
              <CharacterSVG character={char} mood="neutral" size="sm" />
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1A1A1A', textAlign: 'center' }}>
                {char.name}
              </div>
              <div style={{ fontSize: 9, color: '#666', textAlign: 'center' }}>
                {char.role}
              </div>
              <span style={{
                fontSize: 9, padding: '2px 7px', borderRadius: 10,
                fontWeight: 500, background: badge.bg, color: badge.color,
              }}>
                {badge.label}
              </span>
              {/* 负责问题类型 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', marginTop: 2 }}>
                {char.questionCategories.map(cat => (
                  <span key={cat} style={{
                    fontSize: 8, padding: '1px 5px',
                    background: '#F0F0F0', color: '#555',
                    borderRadius: 4,
                  }}>
                    {CATEGORY_LABELS[cat as QuestionCategory]}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
