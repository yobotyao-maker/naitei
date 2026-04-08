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

// ── アニメ表情定義 ────────────────────────────
// topY はアニメ目の上まぶたアーク制御点Y（実際のまぶた位置≈20+topY*0.5）
// 眼白上端 y=31 (cy=40, ry=9)。topY=22 → まぶたy≈31（全開）
type AnimeMoodExpr = {
  leftBrow: string; rightBrow: string;
  leftEyeTopY: number; rightEyeTopY: number;
  mouth: string;
};

const ANIME_MOOD_EXPRESSIONS: Record<CharacterMood, AnimeMoodExpr> = {
  neutral: {
    leftBrow:     'M23 27 Q32 24 41 27',
    rightBrow:    'M49 27 Q58 24 67 27',
    leftEyeTopY:  26, rightEyeTopY: 26,
    mouth:        'M36 55 Q45 58 54 55',
  },
  pleased: {
    leftBrow:     'M23 24 Q32 22 41 24',
    rightBrow:    'M49 24 Q58 22 67 24',
    leftEyeTopY:  22, rightEyeTopY: 22,
    mouth:        'M32 54 Q45 63 58 54',
  },
  strict: {
    leftBrow:     'M23 26 Q29 31 41 25',
    rightBrow:    'M49 25 Q61 31 67 26',
    leftEyeTopY:  34, rightEyeTopY: 34,
    mouth:        'M36 56 Q45 54 54 56',
  },
  surprised: {
    leftBrow:     'M23 22 Q32 19 41 22',
    rightBrow:    'M49 22 Q58 19 67 22',
    leftEyeTopY:  22, rightEyeTopY: 22,
    mouth:        'M40 55 Q45 52 50 55 Q45 63 40 55 Z',
  },
  thinking: {
    leftBrow:     'M23 28 Q32 26 41 28',
    rightBrow:    'M49 25 Q58 24 67 27',
    leftEyeTopY:  31, rightEyeTopY: 28,
    mouth:        'M37 56 Q43 57 52 56',
  },
  disappointed: {
    leftBrow:     'M23 30 Q29 26 41 31',
    rightBrow:    'M49 31 Q61 26 67 30',
    leftEyeTopY:  37, rightEyeTopY: 37,
    mouth:        'M36 58 Q45 54 54 58',
  },
};

// ヘルパー：アニメ目を描画（左右共通ロジック）
function AnimeEye({
  cx, cy, irisColor, skinColor, topY, female,
}: {
  cx: number; cy: number; irisColor: string; skinColor: string; topY: number; female: boolean;
}) {
  const lx = cx - 8.5, rx = cx + 8.5;
  const skinCover = `M${lx} ${cy} Q${cx} ${topY} ${rx} ${cy} L${rx} 15 L${lx} 15 Z`;
  const lashLine  = `M${lx} ${cy} Q${cx} ${topY} ${rx} ${cy}`;
  return (
    <>
      <ellipse cx={cx} cy={cy}   rx={8.5} ry={9}   fill="white" />
      <ellipse cx={cx} cy={cy+1} rx={6.5} ry={7.5} fill={irisColor} />
      <circle  cx={cx} cy={cy+1.5} r={4.5} fill="#0A0A0A" />
      {/* まぶた皮膚カバー */}
      <path d={skinCover} fill={skinColor} />
      {/* ハイライト */}
      <circle cx={cx - 3} cy={cy - 2} r={2.5} fill="white" />
      <circle cx={cx + 3} cy={cy + 4} r={1.3} fill="white" opacity={0.8} />
      {/* まつ毛ライン */}
      <path d={lashLine} stroke="#1A1A1A" strokeWidth={female ? 2.2 : 1.8} fill="none" strokeLinecap="round" />
      {female && (
        <>
          <line x1={lx}    y1={cy}       x2={lx-1.5} y2={topY + 2}   stroke="#1A1A1A" strokeWidth={1.2} strokeLinecap="round" />
          <line x1={cx-4}  y1={topY + 1} x2={cx-5}   y2={topY - 3}   stroke="#1A1A1A" strokeWidth={1.2} strokeLinecap="round" />
          <line x1={rx}    y1={cy}       x2={rx+1.5} y2={topY + 2}   stroke="#1A1A1A" strokeWidth={1.2} strokeLinecap="round" />
          <line x1={cx+4}  y1={topY + 1} x2={cx+5}   y2={topY - 3}   stroke="#1A1A1A" strokeWidth={1.2} strokeLinecap="round" />
        </>
      )}
    </>
  );
}

// ── アニメ男性（桐生：銀髪スパイキー）──────────
function AniMaleCharacter({ character, mood }: { character: Character; mood: CharacterMood }) {
  const e = ANIME_MOOD_EXPRESSIONS[mood];
  const c = character.colors;
  const iris = c.eyeColor ?? '#4A7FA8';
  const suit = c.suit ?? '#1E2A4A';
  const tie  = c.tie  ?? '#2D5BE3';
  return (
    <>
      {/* 髪（後ろ・スパイク群） */}
      <ellipse cx="45" cy="22" rx="23" ry="21" fill={c.hair} />
      <path d="M24 34 Q20 10 30 14 Q26 24 25 36Z" fill={c.hair} />
      <path d="M33 24 Q34  4 43 10 Q38 18 36 28Z" fill={c.hair} />
      <path d="M43 20 Q47  0 55  8 Q49 15 47 25Z" fill={c.hair} />
      <path d="M55 22 Q63  4 68 12 Q62 20 60 30Z" fill={c.hair} />
      <path d="M63 30 Q72 14 72 22 Q68 26 66 34Z" fill={c.hair} />
      {/* 首 */}
      <rect x="39" y="62" width="12" height="12" rx="2" fill={c.skin} />
      {/* 顔 */}
      <ellipse cx="45" cy="41" rx="21" ry="24" fill={c.skin} />
      {/* 耳 */}
      <ellipse cx="23" cy="42" rx="4" ry="5" fill={c.skin} />
      <ellipse cx="67" cy="42" rx="4" ry="5" fill={c.skin} />
      {/* アニメ目（左右） */}
      <AnimeEye cx={32} cy={40} irisColor={iris} skinColor={c.skin} topY={e.leftEyeTopY}  female={false} />
      <AnimeEye cx={58} cy={40} irisColor={iris} skinColor={c.skin} topY={e.rightEyeTopY} female={false} />
      {/* 眉毛 */}
      <path d={e.leftBrow}  stroke="#2A2A2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d={e.rightBrow} stroke="#2A2A2A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* 鼻 */}
      <path d="M44 50 Q45 53 46 50" stroke="#BB8866" strokeWidth="1.2" fill="none" />
      {/* 口 */}
      <path d={e.mouth} stroke="#AA5555" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      {/* 前髪（顔の上に重ねる） */}
      <path d="M25 36 Q28 22 36 22 Q32 30 30 40Z" fill={c.hair} />
      <path d="M65 36 Q62 22 54 22 Q58 30 60 40Z" fill={c.hair} />
      {/* 胴体・スーツ */}
      <path d="M14 128 L14 87 Q19 77 30 73 L45 79 L60 73 Q71 77 76 87 L76 128Z" fill={suit} />
      <path d="M38 73 L45 81 L52 73 L45 77Z" fill="white" />
      <path d="M43 75 L45 79 L47 75 L46 96 Q45 99 44 96Z" fill={tie} />
      <path d="M30 73 L38 73 L45 81 L14 94Z" fill={suit} style={{ filter: 'brightness(0.8)' }} />
      <path d="M60 73 L52 73 L45 81 L76 94Z" fill={suit} style={{ filter: 'brightness(0.8)' }} />
      <path d="M14 128 L14 87 Q19 77 30 73 L45 79 L60 73 Q71 77 76 87 L76 128"
            fill="none" stroke="#1A1A1A" strokeWidth="1.5" />
    </>
  );
}

// ── アニメ女性（蒼井・零）──────────────────────
function AniFemaleCharacter({ character, mood }: { character: Character; mood: CharacterMood }) {
  const e = ANIME_MOOD_EXPRESSIONS[mood];
  const c = character.colors;
  const iris   = c.eyeColor   ?? '#2A6090';
  const jacket = c.jacket     ?? '#4A235A';
  const blouse = c.blouse     ?? '#FFFFFF';
  const style  = c.hairStyle  ?? 'medium';
  return (
    <>
      {/* 髪（後ろ） */}
      {style === 'twintails' && (
        <>
          <ellipse cx="45" cy="21" rx="21" ry="19" fill={c.hair} />
          {/* ツインテール */}
          <path d="M13 48 Q4 65 6 90 Q8 108 14 112 Q18 114 18 106 Q15 90 14 68 Q14 56 18 50Z" fill={c.hair} />
          <path d="M77 48 Q86 65 84 90 Q82 108 76 112 Q72 114 72 106 Q75 90 76 68 Q76 56 72 50Z" fill={c.hair} />
          <circle cx="18" cy="52" r="5" fill={c.hair} />
          <circle cx="72" cy="52" r="5" fill={c.hair} />
        </>
      )}
      {style === 'flowing' && (
        <>
          <ellipse cx="45" cy="23" rx="22" ry="20" fill={c.hair} />
          <path d="M23 36 Q14 65 16 100 Q19 114 25 112 Q23 85 24 54Z" fill={c.hair} />
          <path d="M67 36 Q76 65 74 100 Q71 114 65 112 Q67 85 66 54Z" fill={c.hair} />
        </>
      )}
      {style === 'long' && (
        <>
          <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
          <path d="M24 35 Q18 70 22 110 Q26 118 30 115 Q28 80 31 50Z" fill={c.hair} />
          <path d="M66 35 Q72 70 68 110 Q64 118 60 115 Q62 80 59 50Z" fill={c.hair} />
        </>
      )}
      {style === 'medium' && (
        <>
          <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
          <path d="M24 35 Q19 60 23 85 Q27 90 30 85 Q28 65 31 48Z" fill={c.hair} />
          <path d="M66 35 Q71 60 67 85 Q63 90 60 85 Q62 65 59 48Z" fill={c.hair} />
        </>
      )}
      {style === 'short' && <ellipse cx="45" cy="26" rx="22" ry="20" fill={c.hair} />}
      {style === 'bun'   && (
        <>
          <ellipse cx="45" cy="27" rx="21" ry="19" fill={c.hair} />
          <ellipse cx="45" cy="10" rx="10" ry="9"  fill={c.hair} />
          <rect x="42" y="14" width="6" height="8"  fill={c.hair} />
        </>
      )}
      {/* 首 */}
      <rect x="39" y="62" width="12" height="12" rx="2" fill={c.skin} />
      {/* 顔 */}
      <ellipse cx="45" cy="41" rx="20" ry="23" fill={c.skin} />
      {/* 前髪 */}
      {style === 'twintails' ? (
        <>
          <path d="M26 30 Q30 18 44 16 Q40 24 38 36Z" fill={c.hair} />
          <path d="M64 30 Q60 18 46 16 Q50 24 52 36Z" fill={c.hair} />
          <circle cx="18" cy="52" r="5.5" fill={c.hair} stroke="#1A1A1A" strokeWidth="0.8" />
          <circle cx="72" cy="52" r="5.5" fill={c.hair} stroke="#1A1A1A" strokeWidth="0.8" />
        </>
      ) : style === 'bun' ? (
        <path d="M26 30 Q30 18 45 16 Q60 18 64 30 Q58 23 45 22 Q32 23 26 30Z" fill={c.hair} />
      ) : (
        <path d="M26 32 Q30 19 45 17 Q60 19 64 32 Q58 25 45 23 Q32 25 26 32Z" fill={c.hair} />
      )}
      {/* 耳 */}
      <ellipse cx="24" cy="42" rx="3.5" ry="4.5" fill={c.skin} />
      <ellipse cx="66" cy="42" rx="3.5" ry="4.5" fill={c.skin} />
      {c.accessory === 'earrings' && (
        <>
          <circle cx="24" cy="47" r="2.5" fill="#F0C93A" stroke="#C8A020" strokeWidth="0.8" />
          <circle cx="66" cy="47" r="2.5" fill="#F0C93A" stroke="#C8A020" strokeWidth="0.8" />
        </>
      )}
      {/* アニメ目（左右） */}
      <AnimeEye cx={32} cy={40} irisColor={iris} skinColor={c.skin} topY={e.leftEyeTopY}  female={true} />
      <AnimeEye cx={58} cy={40} irisColor={iris} skinColor={c.skin} topY={e.rightEyeTopY} female={true} />
      {/* 眉毛 */}
      <path d={e.leftBrow}  stroke="#2A2A2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d={e.rightBrow} stroke="#2A2A2A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* チーク */}
      <ellipse cx="28" cy="47" rx="5.5" ry="3" fill="#FFB8B8" opacity="0.4" />
      <ellipse cx="62" cy="47" rx="5.5" ry="3" fill="#FFB8B8" opacity="0.4" />
      {/* 鼻 */}
      <path d="M44 50 Q45 52 46 50" stroke="#CC8888" strokeWidth="1" fill="none" />
      {/* 口 */}
      <path d={e.mouth} stroke="#CC6677" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {c.accessory === 'necklace' && (
        <path d="M35 72 Q45 80 55 72" stroke="#F0C93A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {/* 胴体・ジャケット */}
      <path d="M15 128 L15 88 Q20 78 31 74 L45 80 L59 74 Q70 78 75 88 L75 128Z" fill={jacket} />
      <path d="M38 74 L45 85 L52 74 L45 79Z" fill={blouse} />
      <path d="M31 74 L38 74 L45 85 L15 96Z" fill={jacket} style={{ filter: 'brightness(0.82)' }} />
      <path d="M59 74 L52 74 L45 85 L75 96Z" fill={jacket} style={{ filter: 'brightness(0.82)' }} />
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
      {character.animeStyle
        ? character.gender === 'female'
          ? <AniFemaleCharacter character={character} mood={mood} />
          : <AniMaleCharacter   character={character} mood={mood} />
        : character.gender === 'female'
          ? <FemaleCharacter character={character} mood={mood} />
          : <MaleCharacter   character={character} mood={mood} />
      }
    </svg>
  );
}
