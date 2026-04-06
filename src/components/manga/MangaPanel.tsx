// src/components/manga/MangaPanel.tsx
'use client';

import React from 'react';

interface MangaPanelProps {
  children: React.ReactNode;
  span?: 'full' | 'half';   // 占满整行 or 半行
  className?: string;
  style?: React.CSSProperties;
}

// 单个分格
export function MangaPanel({ children, span = 'half', className = '', style }: MangaPanelProps) {
  return (
    <div
      className={className}
      style={{
        gridColumn: span === 'full' ? 'span 2' : 'span 1',
        background: '#FAFAF8',
        position: 'relative',
        overflow: 'hidden',
        minHeight: span === 'full' ? 80 : 100,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// 分格容器
export function MangaGrid({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3px',
      background: '#1A1A1A',
    }}>
      {children}
    </div>
  );
}

// 音效背景字
export function SFXBackground({ text, color = '#2D5BE3' }: { text: string; color?: string }) {
  return (
    <div style={{
      position: 'absolute',
      right: 8,
      top: 4,
      fontSize: 56,
      fontWeight: 900,
      fontStyle: 'italic',
      color,
      opacity: 0.1,
      lineHeight: 1,
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 0,
    }}>
      {text}
    </div>
  );
}

// 旁白框（章节标题/叙述说明）
export function NarrationBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      margin: '0 12px 8px',
      padding: '6px 12px',
      background: '#FFFFF0',
      border: '1.5px solid #999',
      fontSize: 11,
      color: '#444',
      fontStyle: 'italic',
      lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

// 结果印章
export function ResultStamp({
  label,
  variant,
}: {
  label: string;
  variant: 'pass' | 'fail' | 'pending' | 'excellent';
}) {
  const colorMap = {
    pass:      { color: '#2D5BE3', border: '3px solid #2D5BE3', rotate: '-3deg' },
    fail:      { color: '#E74C3C', border: '3px solid #E74C3C', rotate: '-2deg' },
    pending:   { color: '#C89B00', border: '3px solid #F0C93A', rotate: '-1deg' },
    excellent: { color: '#1A8A3C', border: '3px solid #27AE60', rotate: '-4deg' },
  };
  const s = colorMap[variant];
  return (
    <div style={{
      display: 'inline-block',
      border: s.border,
      color: s.color,
      borderRadius: 8,
      padding: '5px 16px',
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: 3,
      transform: `rotate(${s.rotate})`,
      userSelect: 'none',
    }}>
      {label}
    </div>
  );
}
