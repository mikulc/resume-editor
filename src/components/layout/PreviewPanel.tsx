import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ResumePreview } from '../preview/PreviewComponents';
import { FloatingToolbar } from '../preview/FloatingToolbar';
import { useAppUI, useHistory } from '../../context/ResumeContext';
import { useTextSelection } from '../../hooks/useTextSelection';
import { SaveStatusIndicator } from '../common/SaveStatusIndicator';

interface PreviewPanelProps {
  previewRef: React.RefObject<HTMLDivElement>;
  isExporting: boolean;
  onExportPDF: () => void;
}

export function PreviewPanel({ previewRef, isExporting, onExportPDF }: PreviewPanelProps) {
  const { ui, uiDispatch } = useAppUI();
  const [dragStart, setDragStart] = useState(0);
  const [dragZoom, setDragZoom] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 全局撤销 / 重做
  const { undo, redo, canUndo, canRedo } = useHistory();

  // 文本选中 & 悬浮工具栏
  const {
    selection,
    showToolbar,
    handleMouseUp,
    handleToggleBold,
    handleToggleItalic,
    handleClearFormat,
    closeToolbar,
    handleMouseLeave,
  } = useTextSelection(scrollContainerRef as React.RefObject<HTMLElement | null>);

  // 全局快捷键 Ctrl+Z / Ctrl+Y（抽屉关闭时生效）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (ui.drawerOpen) return; // 抽屉打开时，由抽屉内部处理
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          redo();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, ui.drawerOpen]);

  const setZoom = useCallback(
    (newZoom: number) => {
      uiDispatch({ type: 'SET_ZOOM', payload: newZoom });
    },
    [uiDispatch]
  );

  // 首次加载时自适应一次，之后 zoom 仅由用户手动调整，不随窗口 resize 自动变化
  useEffect(() => {
    // 仅在首次加载且尚未手动调整过 zoom（仍为默认值 1）时自适应
    if (ui.zoom !== 1) return;

    const container = document.getElementById('preview-container');
    if (container) {
      const availableWidth = container.clientWidth - 64;
      const a4Width = 794;
      const fitScale = Math.min(availableWidth / a4Width, 1);
      if (fitScale < 1) {
        uiDispatch({ type: 'SET_ZOOM', payload: Math.round(fitScale * 100) / 100 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFitToWidth = () => {
    const container = document.getElementById('preview-container');
    if (container) {
      const availableWidth = container.clientWidth - 64;
      const a4Width = 794;
      const fitScale = Math.min(availableWidth / a4Width, 1);
      setZoom(Math.round(fitScale * 100) / 100);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(1.5, ui.zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.3, ui.zoom - 0.1));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Preview Control Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200">
              <svg className="w-[18px] h-[18px] text-white" viewBox="0 0 28 28" fill="none" stroke="currentColor">
                {/* 简历文档主体 */}
                <path d="M7 3.5h9.172a2 2 0 011.414.586l4.828 4.828a2 2 0 01.586 1.414V22.5a2 2 0 01-2 2H7a2 2 0 01-2-2V5.5a2 2 0 012-2z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                {/* 文档折角 */}
                <path d="M17 3.5v4.5a1 1 0 001 1h4.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                {/* 标题行 */}
                <path d="M8.5 14h7" strokeWidth="1.8" strokeLinecap="round" />
                {/* 正文行 1 */}
                <path d="M8.5 17.5h11" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                {/* 正文行 2 */}
                <path d="M8.5 20.5h9" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                {/* 预览标记 - 右上角小眼睛 */}
                <circle cx="20.5" cy="10.5" r="3.5" fill="currentColor" stroke="none" opacity="0.15" />
                <circle cx="20.5" cy="10.5" r="1.2" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="ml-1">
              <span className="text-gray-700 font-semibold text-sm">简历预览</span>
            </div>
          </div>
          {/* Save Status Indicator */}
          <SaveStatusIndicator
            saveStatus={ui.saveStatus}
            saveTrigger={ui.saveTrigger}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          {/* 撤销 / 重做按钮 */}
          <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-500 transition-all"
              title="撤销 (Ctrl+Z)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l4 4M3 10l-4 4" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-500 transition-all"
              title="重做 (Ctrl+Y)"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-4 4M21 10l4 4" />
              </svg>
            </button>
          </div>

          {/* 缩放控件 */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-200 p-0.5">
            <button
              onClick={handleZoomOut}
              disabled={ui.zoom <= 0.3}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-500 transition-all"
              title="缩小"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <button
              onClick={handleFitToWidth}
              className="px-2.5 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-xs font-medium text-gray-600 transition-all min-w-[50px]"
              title="适应宽度"
            >
              {Math.round(ui.zoom * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={ui.zoom >= 1.5}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-500 transition-all"
              title="放大"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* 分割线 */}
            <div className="w-px h-4 bg-gray-300" />

            <button
              onClick={handleResetZoom}
              disabled={ui.zoom === 1}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm disabled:opacity-30 text-gray-500 transition-all"
              title="重置缩放"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => uiDispatch({ type: 'TOGGLE_SETTINGS' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              ui.settingsOpen
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {ui.settingsOpen ? '隐藏设置' : '显示设置'}
          </button>
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            data-export-pdf
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg text-xs font-medium transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            {isExporting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                导出中...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出 PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div
        ref={scrollContainerRef}
        id="preview-container"
        className="flex-1 overflow-auto flex justify-center pt-6 pb-12 px-8 hide-scrollbar relative"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={previewRef as React.RefObject<HTMLDivElement>}
          style={{
            transform: `scale(${ui.zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: 'max-content',
            maxWidth: `${100 / ui.zoom}%`,
            paddingBottom: `${Math.round(48 / ui.zoom)}px`,
          }}
        >
          <ResumePreview />
        </div>

        {/* 悬浮格式工具栏 */}
        {showToolbar && selection && (
          <FloatingToolbar
            selection={selection}
            containerRef={scrollContainerRef as React.RefObject<HTMLElement | null>}
            onToggleBold={handleToggleBold}
            onToggleItalic={handleToggleItalic}
            onClearFormat={handleClearFormat}
            onClose={closeToolbar}
          />
        )}
      </div>
    </div>
  );
}
