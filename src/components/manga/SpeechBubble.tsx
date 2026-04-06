// src/components/manga/SpeechBubble.tsx
'use client';

import React from 'react';
import { BubbleType } from './manga-design-system';

interface SpeechBubbleProps {
  children: React.ReactNode;
  type?: BubbleType;
  direction?: 'left' | 'right';  // 尾巴朝向，左=面试官，右=用户
  tag?: string;                   // 顶部标签，如「技術問題」
  className?: string;
  style?: React.CSSProperties;
}

export function SpeechBubble({
  children,
  type = 'speech',
  direction = 'left',
  tag,
  className = '',
  style,
}: SpeechBubbleProps) {

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    padding: '10px 14px',
    fontSize: '13px',
    lineHeight: '1.65',
    color: '#1A1A1A',
  };

  const typeStyles: Record<BubbleType, React.CSSProperties> = {
    speech: {
      background: '#FFFFFF',
      border: '2px solid #1A1A1A',
      borderRadius: direction === 'left' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
    },
    thought: {
      background: '#F8F8FF',
      border: '2px dashed #666',
      borderRadius: '16px',
      fontStyle: 'italic',
    },
    shout: {
      background: '#FFF9E6',
      border: '3px solid #1A1A1A',
      borderRadius: '6px',
      fontWeight: '700',
      fontSize: '15px',
      transform: 'rotate(-0.8deg)',
    },
    narration: {
      background: '#FFFFF0',
      border: '2px solid #999',
      borderRadius: '4px',
      fontStyle: 'italic',
      fontSize: '11px',
      color: '#444',
    },
    sfx: {
      background: 'transparent',
      border: 'none',
      fontWeight: '900',
      fontSize: '28px',
      color: '#2D5BE3',
      letterSpacing: '2px',
      fontStyle: 'italic',
    },
  };

  // 气泡尾巴（伪元素用内联 SVG 实现）
  const TailLeft = () => (
    <svg
      style={{ position: 'absolute', left: -10, bottom: 10, width: 12, height: 14 }}
      viewBox="0 0 12 14"
    >
      <path d="M12 0 L0 7 L12 14Z" fill="#1A1A1A" />
      <path d="M12 2 L2 7 L12 12Z" fill="white" />
    </svg>
  );

  const TailRight = () => (
    <svg
      style={{ position: 'absolute', right: -10, bottom: 10, width: 12, height: 14 }}
      viewBox="0 0 12 14"
    >
      <path d="M0 0 L12 7 L0 14Z" fill="#1A1A1A" />
      <path d="M0 2 L10 7 L0 12Z" fill="#FFFEF0" />
    </svg>
  );

  return (
    <div style={{ ...baseStyle, ...typeStyles[type], ...style }} className={className}>
      {tag && (
        <span style={{
          display: 'inline-block',
          background: '#2D5BE3',
          color: '#FFFFFF',
          fontSize: '10px',
          padding: '2px 8px',
          borderRadius: '4px',
          marginBottom: '6px',
          fontWeight: '500',
          letterSpacing: '0.3px',
        }}>
          {tag}
        </span>
      )}
      {type === 'speech' && direction === 'left' && <TailLeft />}
      {type === 'speech' && direction === 'right' && <TailRight />}
      {children}
    </div>
  );
}
