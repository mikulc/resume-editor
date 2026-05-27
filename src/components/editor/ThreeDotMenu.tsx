import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ThreeDotMenuProps {
  onEdit?: () => void;
  onDelete: () => void;
}

/**
 * 三点下拉菜单组件
 * 替换原来的红色 X 删除按钮，提供「编辑」和「删除」两个选项
 * - 点击打开菜单、点击菜单外关闭、按 ESC 关闭、选择选项后关闭
 */
export function ThreeDotMenu({ onEdit, onDelete }: ThreeDotMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 点击外部关闭 & ESC 关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeMenu]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    closeMenu();
    onDelete();
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="text-gray-400 hover:text-gray-600 p-2 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-gray-100"
        title="更多操作"
      >
        {/* 三点 ⋮ 图标 */}
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
          <circle cx="8" cy="2.5" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13.5" r="1.5" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-1 z-50 min-w-[110px] bg-white border border-gray-200 rounded-lg shadow-lg py-1 animate-in"
          style={{
            animation: 'dropdown-appear 0.12s ease-out',
          }}
        >
          {/* 编辑选项 */}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors text-left"
            >
              {/* 编辑图标 */}
              <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>编辑</span>
            </button>
          )}

          {/* 删除选项 */}
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors text-left"
          >
            {/* 垃圾桶图标 */}
            <svg className="w-3.5 h-3.5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>删除</span>
          </button>
        </div>
      )}
    </div>
  );
}
