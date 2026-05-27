import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { isRangeItalic, clearFormatAtPosition } from '../../utils/markdown';
import { useAppUI } from '../../context/ResumeContext';

interface HighlightDrawerProps {
  isOpen: boolean;
  title: string;
  text: string;
  /** 要点编号（1-based） */
  highlightIndex: number;
  /** 总要点数 */
  totalCount: number;
  onTextChange: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const DRAWER_MAX_HISTORY = 50;

/**
 * 右侧滑出抽屉式编辑器
 * - 包含局部撤销/重做历史栈（独立于全局栈）
 * - Ctrl+Z/Y 在抽屉打开时优先作用于此
 */
export function HighlightDrawer({
  isOpen,
  title,
  text,
  highlightIndex,
  totalCount,
  onTextChange,
  onSave,
  onCancel,
}: HighlightDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const { uiDispatch } = useAppUI();

  // ====== 抽屉局部历史栈 ======
  const localHistoryRef = useRef<string[]>([]);
  const localIdxRef = useRef(-1);
  const localSkipRef = useRef(false);
  const [localCanUndo, setLocalCanUndo] = useState(false);
  const [localCanRedo, setLocalCanRedo] = useState(false);

  const updateLocalButtons = useCallback(() => {
    setLocalCanUndo(localIdxRef.current > 0);
    setLocalCanRedo(localIdxRef.current < localHistoryRef.current.length - 1);
  }, []);

  const resetLocalHistory = useCallback((initialText: string) => {
    localHistoryRef.current = [initialText];
    localIdxRef.current = 0;
    updateLocalButtons();
  }, [updateLocalButtons]);

  const localUndo = useCallback(() => {
    if (localIdxRef.current <= 0) return;
    localIdxRef.current--;
    localSkipRef.current = true;
    onTextChange(localHistoryRef.current[localIdxRef.current]);
    updateLocalButtons();
  }, [onTextChange, updateLocalButtons]);

  const localRedo = useCallback(() => {
    if (localIdxRef.current >= localHistoryRef.current.length - 1) return;
    localIdxRef.current++;
    localSkipRef.current = true;
    onTextChange(localHistoryRef.current[localIdxRef.current]);
    updateLocalButtons();
  }, [onTextChange, updateLocalButtons]);

  // 自动记录每次文本变更到局部历史栈
  const prevTextRef = useRef(text);
  useEffect(() => {
    if (localSkipRef.current) {
      localSkipRef.current = false;
      prevTextRef.current = text;
      updateLocalButtons();
      return;
    }
    if (text === prevTextRef.current) return;

    localHistoryRef.current = [
      ...localHistoryRef.current.slice(0, localIdxRef.current + 1),
      text,
    ];
    if (localHistoryRef.current.length > DRAWER_MAX_HISTORY) {
      localHistoryRef.current.shift();
    } else {
      localIdxRef.current++;
    }
    prevTextRef.current = text;
    updateLocalButtons();
  }, [text, updateLocalButtons]);

  // 抽屉打开时初始化局部历史栈 & 设置 drawerOpen
  useEffect(() => {
    if (isOpen) {
      resetLocalHistory(text);
      uiDispatch({ type: 'SET_DRAWER_OPEN', payload: true });
      return () => {
        uiDispatch({ type: 'SET_DRAWER_OPEN', payload: false });
      };
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // 控制滑入/滑出动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 打开时自动聚焦文本框
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 键盘快捷键：ESC 关闭 / Ctrl+Z 局部撤销 / Ctrl+Y 局部重做
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          e.stopPropagation();
          localUndo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          e.stopPropagation();
          localRedo();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, localUndo, localRedo]);

  // 点击抽屉外部关闭（遮罩层）
  const handleOverlayClick = useCallback(() => {
    onCancel();
  }, [onCancel]);

  // 加粗按钮：在文本框选中区域包裹 ** 标记
  const handleBold = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (start === end) {
      // 无选中文本，插入 **** 占位并定位光标到中间
      const newText = text.substring(0, start) + '****' + text.substring(end);
      onTextChange(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start + 2, start + 2);
      });
    } else {
      // 选中文本，包裹 **
      const selectedText = text.substring(start, end);
      // 检查是否已被 ** 包裹
      if (
        start >= 2 &&
        end + 2 <= text.length &&
        text.substring(start - 2, start) === '**' &&
        text.substring(end, end + 2) === '**'
      ) {
        // 已加粗 → 移除 **
        const newText =
          text.substring(0, start - 2) + selectedText + text.substring(end + 2);
        onTextChange(newText);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start - 2, end - 2);
        });
      } else {
        // 未加粗 → 添加 **
        const newText =
          text.substring(0, start) + '**' + selectedText + '**' + text.substring(end);
        onTextChange(newText);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start + 2, end + 2);
        });
      }
    }
  }, [text, onTextChange]);

  // 斜体按钮：在文本框选中区域包裹 * 标记，自动在标记前后添加空格
  const handleItalic = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (start === end) {
      // 无选中文本，插入 ** 占位并定位光标到中间
      const newText = text.substring(0, start) + '**' + text.substring(end);
      onTextChange(newText);
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start + 1, start + 1);
      });
    } else {
      // 选中文本，检查是否已被 * 包裹（排除纯加粗 ** 的误判）
      if (isRangeItalic(text, start, end)) {
        // 已斜体 → 移除 *
        const selectedText = text.substring(start, end);
        const newText =
          text.substring(0, start - 1) + selectedText + text.substring(end + 1);
        onTextChange(newText);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start - 1, start - 1 + (end - start));
        });
      } else {
        // 未斜体 → 添加 *
        const selectedText = text.substring(start, end);
        const newText =
          text.substring(0, start) + '*' + selectedText + '*' + text.substring(end);
        onTextChange(newText);
        requestAnimationFrame(() => {
          ta.focus();
          ta.setSelectionRange(start + 1, start + 1 + selectedText.length);
        });
      }
    }
  }, [text, onTextChange]);

  // 清除格式按钮：移除选中文本的所有 ** 和 * 标记
  const handleClearFormat = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (start === end) return; // 无选中文本则无操作

    const newText = clearFormatAtPosition(text, start, end);
    if (newText === text) return;

    onTextChange(newText);
    // 恢复光标到新位置（清除格式后选区内容变短）
    requestAnimationFrame(() => {
      ta.focus();
      const cleanMiddle = text.substring(start, end).replace(/\*/g, '');
      const newCursorPos = start + cleanMiddle.length;
      ta.setSelectionRange(start, newCursorPos);
    });
  }, [text, onTextChange]);

  if (!isVisible) return null;

  const drawerContent = (
    <>
      {/* 模糊遮罩层：除抽屉外的区域添加背景模糊 */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-all duration-300"
        style={{
          left: '300px',
          opacity: isAnimating ? 1 : 0,
          pointerEvents: isAnimating ? 'auto' : 'none',
        }}
        onClick={handleOverlayClick}
      />

      {/* 抽屉主体 */}
      <div
        ref={drawerRef}
        className="fixed top-0 bottom-0 right-0 z-50 bg-white flex flex-col shadow-2xl"
        style={{
          left: '60%',
          transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-800">
              {title}
              <span className="ml-2 text-xs text-gray-400 font-normal">
                {highlightIndex} / {totalCount}
              </span>
            </h3>

            {/* 局部撤销按钮 ↶ */}
            <button
              onClick={localUndo}
              disabled={!localCanUndo}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-40"
              title="撤销 (Ctrl+Z)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4 4M3 10l-4 4" />
              </svg>
            </button>

            {/* 局部重做按钮 ↷ */}
            <button
              onClick={localRedo}
              disabled={!localCanRedo}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-40"
              title="重做 (Ctrl+Y)"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-4 4M21 10l4 4" />
              </svg>
            </button>

            <div className="w-px h-4 bg-gray-300" />

            {/* 加粗按钮 B */}
            <button
              onClick={handleBold}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
              title="加粗选中文本"
            >
              <span className="text-xs font-bold">B</span>
            </button>

            {/* 斜体按钮 I */}
            <button
              onClick={handleItalic}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
              title="斜体选中文本"
            >
              <span className="text-xs italic">I</span>
            </button>

            {/* 清除格式按钮（橡皮擦） */}
            <button
              onClick={handleClearFormat}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
              title="清除选中文本格式"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                <path d="M22 21H7" />
                <path d="m5 11 9 9" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* 取消按钮 */}
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              取消
            </button>

            {/* 保存按钮 - 蓝色主按钮 */}
            <button
              onClick={onSave}
              className="px-4 py-1.5 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm font-medium"
            >
              保存
            </button>
          </div>
        </div>

        {/* 中间编辑区 */}
        <div className="flex-1 overflow-hidden p-5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="在此编辑要点内容，支持 **加粗**、*斜体* 标记..."
            className="w-full h-full resize-none bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 placeholder:text-gray-400 leading-relaxed focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors"
            style={{
              minHeight: '250px',
              maxHeight: '80%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>
    </>
  );

  return createPortal(drawerContent, document.body);
}
