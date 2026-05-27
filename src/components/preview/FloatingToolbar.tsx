import React from 'react';
import { SelectionState } from '../../hooks/useTextSelection';

interface FloatingToolbarProps {
  selection: SelectionState;
  containerRef: React.RefObject<HTMLElement | null>;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onClearFormat: () => void;
  onClose: () => void;
}

export function FloatingToolbar({
  selection,
  containerRef,
  onToggleBold,
  onToggleItalic,
  onClearFormat,
  onClose,
}: FloatingToolbarProps) {
  if (!selection.rect || !containerRef.current) return null;

  const containerRect = containerRef.current.getBoundingClientRect();
  const { rect } = selection;
  const scrollTop = containerRef.current.scrollTop;
  const scrollLeft = containerRef.current.scrollLeft;

  // 计算工具栏位置：选中文字上方居中
  const toolbarWidth = 148; // B | I | 橡皮擦 | 关闭
  const toolbarHeight = 36;
  const gap = 8; // 与选中区域的间距

  // 相对于容器内容区域的位置（考虑滚动偏移）
  let top = rect.top - containerRect.top + scrollTop - toolbarHeight - gap;
  let left =
    rect.left - containerRect.left + scrollLeft + rect.width / 2 - toolbarWidth / 2;

  // 边界防护：顶部溢出
  if (top < scrollTop) {
    // 显示在选中区域下方
    top = rect.top - containerRect.top + scrollTop + rect.height + gap;
  }

  // 边界防护：左右溢出
  const maxLeft = containerRect.width - toolbarWidth - 4;
  if (left < 4) {
    left = 4;
  } else if (left > maxLeft) {
    left = maxLeft;
  }

  return (
    <div
      data-toolbar="true"
      className="floating-toolbar"
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 1000,
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleBold();
        }}
        className="floating-toolbar-btn"
        title="加粗 / 取消加粗"
      >
        <span className="font-bold text-sm">B</span>
      </button>
      <div className="w-px h-4 bg-gray-300" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleItalic();
        }}
        className="floating-toolbar-btn"
        title="斜体 / 取消斜体"
      >
        <span className="italic text-sm">I</span>
      </button>
      <div className="w-px h-4 bg-gray-300" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClearFormat();
        }}
        className="floating-toolbar-btn"
        title="清除格式"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
          <path d="M22 21H7" />
          <path d="m5 11 9 9" />
        </svg>
      </button>
      <div className="w-px h-4 bg-gray-300" />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className="floating-toolbar-btn"
        title="关闭"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
