// src/components/manga/CharacterSVG.tsx
'use client';

import React from 'react';
import { Character, CharacterMood } from './manga-design-system';

interface CharacterSVGProps {
  character: Character;
  mood?: CharacterMood;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = { sm: 64, md: 100, lg: 140 };

const MOOD_EXPRESSIONS: Record<CharacterMood, {
  leftBrow: string; rightBrow: string;
  leftEye: string;  rightEye: string;
  mouth: string;
}> = {
  neutral: {
    leftBrow:  'M28 32 Q33 30 38 32',
    rightBrow: 'M52 32 Q57 30 62 32',
    leftEye:   'M32 38 Q35.5 35 39 38 Q35.5 41 32 38',
    rightEye:  'M51 38 Q54.5 35 58 38 Q54.5 41 51 38',
    mouth:     'M35 51 Q45 54 55 51',
  },
  pleased: {
    leftBrow:  'M28 30 Q33 27 38 29',
    rightBrow: 'M52 29 Q57 27 62 30',
    leftEye:   'M32 37 Q35.5 34 39 37 Q35.5 40 32 37',
    rightEye:  'M51 37 Q54.5 34 58 37 Q54.5 40 51 37',
    mouth:     'M33 50 Q45 57 57 50',
  },
  strict: {
    leftBrow:  'M28 30 Q33 27 38 31',
    rightBrow: 'M52 31 Q57 27 62 30',
    leftEye:   'M32 39 Q35.5 37 39 39',
    rightEye:  'M51 39 Q54.5 37 58 39',
    mouth:     'M35 52 Q45 50 55 52',
  },
  surprised: {
    leftBrow:  'M28 28 Q33 25 38 27',
    rightBrow: 'M52 27 Q57 25 62 28',
    leftEye:   'M31 38 Q35.5 33 40 38 Q35.5 43 31 38',
    rightEye:  'M50 38 Q54.5 33 59 38 Q54.5 43 50 38',
    mouth:     'M38 52 Q45 58 52 52 Q45 60 38 52',
  },
  thinking: {
    leftBrow:  'M28 31 Q33 29 38 32',
    rightBrow: 'M52 30 Q57 29 62 32',
    leftEye:   'M32 39 Q35.5 37 39 39',
    rightEye:  'M51 38 Q54.5 36 58 38',
    mouth:     'M36 52 Q43 51 52 53',
  },
  disappointed: {
    leftBrow:  'M28 33 Q33 31 38 34',
    rightBrow: 'M52 34 Q57 31 62 33',
    leftEye:   'M32 40 Q35.5 38 39 40',
    rightEye:  'M51 40 Q54.5 38 58 40',
    mouth:     'M35 54 Q45 50 55 54',
  },
};

// ── 男性角色 SVG ───────────────────────────────
function MaleCharacter({ character, mood }: { character: Character; mood: CharacterMood }) {
  const expr = MOOD_EXPRESSIONS[mood];
  const c = character.colors;
  return (
    <>
      {/* 头发后部 */}
      <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
      {/* 脖子 */}
      <rect x="39" y="59" width="12" height="13" rx="2" fill={c.skin} />
      {/* 脸 */}
      <ellipse cx="45" cy="41" rx="20" ry="22" fill={c.skin} />
      {/* 发际线 */}
      <path d="M25 31 Q29 17 45 15 Q61 17 65 31 Q59 23 45 21 Q31 23 25 31Z" fill={c.hair} />
      {/* 耳朵 */}
      <ellipse cx="24" cy="42" rx="4" ry="5" fill={c.skin} />
      <ellipse cx="66" cy="42" rx="4" ry="5" fill={c.skin} />
      {/* 眉毛 */}
      <path d={expr.leftBrow}  stroke={c.hair} strokeWidth="2"   strokeLinecap="round" fill="none" />
      <path d={expr.rightBrow} stroke={c.hair} strokeWidth="2"   strokeLinecap="round" fill="none" />
      {/* 眼白 */}
      <ellipse cx="35.5" cy="38" rx="5.5" ry="5" fill="white" />
      <ellipse cx="54.5" cy="38" rx="5.5" ry="5" fill="white" />
      {/* 眼珠 */}
      <path d={expr.leftEye}  fill="#1A1A1A" />
      <path d={expr.rightEye} fill="#1A1A1A" />
      {/* 高光 */}
      <circle cx="37" cy="36.5" r="1.3" fill="white" />
      <circle cx="56" cy="36.5" r="1.3" fill="white" />
      {/* 眼镜（如有） */}
      {c.glasses && (
        <g stroke={c.glasses} strokeWidth="1.5" fill="none">
          <rect x="27" y="34" width="14" height="9" rx="3" />
          <rect x="49" y="34" width="14" height="9" rx="3" />
          <line x1="41" y1="38" x2="49" y2="38" />
          <line x1="27" y1="38" x2="24" y2="41" />
          <line x1="63" y1="38" x2="66" y2="41" />
        </g>
      )}
      {/* 鼻子 */}
      <path d="M44 46 Q45 49 46 46" stroke="#cc8866" strokeWidth="1.2" fill="none" />
      {/* 嘴巴 */}
      <path d={expr.mouth} stroke="#AA5555" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 西装身体 */}
      <path d="M14 128 L14 87 Q19 77 30 73 L45 79 L60 73 Q71 77 76 87 L76 128Z" fill={c.suit} />
      {/* 衬衫白领 */}
      <path d="M38 73 L45 81 L52 73 L45 77Z" fill="white" />
      {/* 领带 */}
      <path d="M43 75 L45 79 L47 75 L46 96 Q45 99 44 96Z" fill={c.tie} />
      {/* 西装翻领阴影 */}
      <path d="M30 73 L38 73 L45 81 L14 94Z" fill={c.suit} style={{ filter: 'brightness(0.8)' }} />
      <path d="M60 73 L52 73 L45 81 L76 94Z" fill={c.suit} style={{ filter: 'brightness(0.8)' }} />
      {/* 西装描边 */}
      <path d="M14 128 L14 87 Q19 77 30 73 L45 79 L60 73 Q71 77 76 87 L76 128"
            fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
    </>
  );
}

// ── 女性角色 SVG ───────────────────────────────
function FemaleCharacter({ character, mood }: { character: Character; mood: CharacterMood }) {
  const expr = MOOD_EXPRESSIONS[mood];
  const c = character.colors;
  const hairStyle = c.hairStyle ?? 'medium';

  return (
    <>
      {/* 头发后部（根据发型不同） */}
      {hairStyle === 'long' && (
        <>
          <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
          <path d="M24 35 Q18 70 22 110 Q26 118 30 115 Q28 80 31 50Z" fill={c.hair} />
          <path d="M66 35 Q72 70 68 110 Q64 118 60 115 Q62 80 59 50Z" fill={c.hair} />
        </>
      )}
      {hairStyle === 'medium' && (
        <>
          <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
          <path d="M24 35 Q19 60 23 85 Q27 90 30 85 Q28 65 31 48Z" fill={c.hair} />
          <path d="M66 35 Q71 60 67 85 Q63 90 60 85 Q62 65 59 48Z" fill={c.hair} />
        </>
      )}
      {hairStyle === 'short' && (
        <ellipse cx="45" cy="26" rx="22" ry="20" fill={c.hair} />
      )}
      {hairStyle === 'bun' && (
        <>
          <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
          {/* 头顶发髻 */}
          <ellipse cx="45" cy="10" rx="10" ry="9" fill={c.hair} />
          <rect x="42" y="14" width="6" height="8" fill={c.hair} />
        </>
      )}

      {/* 脖子 */}
      <rect x="39" y="59" width="12" height="13" rx="2" fill={c.skin} />
      {/* 脸 */}
      <ellipse cx="45" cy="41" rx="19" ry="21" fill={c.skin} />
      {/* 发际线前部 */}
      {hairStyle === 'bun' ? (
        <path d="M26 30 Q30 18 45 16 Q60 18 64 30 Q58 23 45 22 Q32 23 26 30Z" fill={c.hair} />
      ) : (
        <path d="M26 32 Q30 19 45 17 Q60 19 64 32 Q58 25 45 23 Q32 25 26 32Z" fill={c.hair} />
      )}
      {/* 耳朵 */}
      <ellipse cx="25" cy="42" rx="3.5" ry="4.5" fill={c.skin} />
      <ellipse cx="65" cy="42" rx="3.5" ry="4.5" fill={c.skin} />
      {/* 耳环（如有） */}
      {c.accessory === 'earrings' && (
        <>
          <circle cx="25" cy="47" r="2.5" fill="#F0C93A" stroke="#C8A020" strokeWidth="0.8" />
          <circle cx="65" cy="47" r="2.5" fill="#F0C93A" stroke="#C8A020" strokeWidth="0.8" />
        </>
      )}
      {/* 眉毛（更细） */}
      <path d={expr.leftBrow}  stroke={c.hair} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d={expr.rightBrow} stroke={c.hair} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* 眼白（女性眼睛略大） */}
      <ellipse cx="35.5" cy="38" rx="6" ry="5.5" fill="white" />
      <ellipse cx="54.5" cy="38" rx="6" ry="5.5" fill="white" />
      {/* 睫毛 */}
      <path d="M29.5 35.5 L31 33.5" stroke={c.hair} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M35.5 33.5 L35.5 31.5" stroke={c.hair} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M41.5 35.5 L43 33.5" stroke={c.hair} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M48.5 35.5 L47 33.5" stroke={c.hair} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M54.5 33.5 L54.5 31.5" stroke={c.hair} strokeWidth="1" strokeLinecap="round" fill="none"/>
      <path d="M60.5 35.5 L59 33.5" stroke={c.hair} strokeWidth="1" strokeLinecap="round" fill="none"/>
      {/* 眼珠 */}
      <path d={expr.leftEye}  fill="#1A1A1A" />
      <path d={expr.rightEye} fill="#1A1A1A" />
      {/* 高光 */}
      <circle cx="37" cy="36.5" r="1.4" fill="white" />
      <circle cx="56" cy="36.5" r="1.4" fill="white" />
      {/* 腮红 */}
      <ellipse cx="30" cy="46" rx="5" ry="3" fill="#FFB8B8" opacity="0.35" />
      <ellipse cx="60" cy="46" rx="5" ry="3" fill="#FFB8B8" opacity="0.35" />
      {/* 鼻子 */}
      <path d="M44 46 Q45 48.5 46 46" stroke="#cc8888" strokeWidth="1" fill="none" />
      {/* 嘴巴（带口红色） */}
      <path d={expr.mouth} stroke="#CC6677" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* 项链（如有） */}
      {c.accessory === 'necklace' && (
        <path d="M35 72 Q45 80 55 72" stroke="#F0C93A" strokeWidth="1.5" fill="none"
              strokeLinecap="round" />
      )}
      {/* 外套身体 */}
      <path d="M15 128 L15 88 Q20 78 31 74 L45 80 L59 74 Q70 78 75 88 L75 128Z" fill={c.jacket} />
      {/* 内衬衫/领口 V领 */}
      <path d="M38 74 L45 85 L52 74 L45 79Z" fill={c.blouse} />
      {/* 翻领 */}
      <path d="M31 74 L38 74 L45 85 L15 96Z" fill={c.jacket} style={{ filter: 'brightness(0.82)' }} />
      <path d="M59 74 L52 74 L45 85 L75 96Z" fill={c.jacket} style={{ filter: 'brightness(0.82)' }} />
      {/* 外套描边 */}
      <path d="M15 128 L15 88 Q20 78 31 74 L45 80 L59 74 Q70 78 75 88 L75 128"
            fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
    </>
  );
}

// ── 主导出组件 ────────────────────────────────
export function CharacterSVG({
  character,
  mood = 'neutral',
  size = 'md',
  className = '',
}: CharacterSVGProps) {
  const px = SIZE_MAP[size];
  return (
    <svg
      width={px}
      height={Math.round(px * 1.42)}
      viewBox="0 0 90 128"
      className={className}
      style={{ display: 'block' }}
    >
      {character.gender === 'female'
        ? <FemaleCharacter character={character} mood={mood} />
        : <MaleCharacter   character={character} mood={mood} />
      }
    </svg>
  );
}
