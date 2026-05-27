import React from 'react';
import { useAppUI } from '../../context/ResumeContext';
import { ThemeSettings } from '../../types/resume';
import { useConfirm } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';

const colorThemeOptions: { value: ThemeSettings['colorTheme']; label: string; colors: string[] }[] = [
  { value: 'blue', label: '浅蓝主题', colors: ['#DBEAFE', '#3B82F6'] },
  { value: 'gray', label: '灰色主题', colors: ['#F3F4F6', '#6B7280'] },
  { value: 'black', label: '深色主题', colors: ['#E5E7EB', '#374151'] },
];

export function SettingsPanel() {
  const { ui, uiDispatch } = useAppUI();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const updateTheme = (partial: Partial<ThemeSettings>) => {
    uiDispatch({ type: 'SET_THEME', payload: partial });
  };

  const handleResetStyle = async () => {
    const confirmed = await confirm({
      title: '重置文档设置',
      message: '确定要重置所有文档设置吗？当前的主题、页边距、行间距、字体大小等配置将恢复为默认值。',
      confirmText: '确认重置',
      cancelText: '取消',
    });
    if (confirmed) {
      uiDispatch({ type: 'RESET_STYLE' });
      showToast('文档设置已重置');
    }
  };

  const { theme } = ui;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h3 className="text-gray-800 font-semibold text-sm">文档设置</h3>
          <p className="text-gray-400 text-xs">外观与导出配置</p>
        </div>
        <button
          onClick={() => uiDispatch({ type: 'SET_SETTINGS_OPEN', payload: false })}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="收起面板"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 hide-scrollbar">
        {/* Template + Color Theme */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          {/* Template Selection (Coming Soon) */}
          <div className="mb-3 pb-3 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">模板选择</h4>
            <p className="text-xs text-gray-400 italic">敬请期待</p>
          </div>

          <h4 className="text-sm font-semibold text-gray-800 mb-3">主题颜色</h4>
          <div className="space-y-1.5">
            {colorThemeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateTheme({ colorTheme: opt.value })}
                className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left ${
                  theme.colorTheme === opt.value
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: opt.colors[0] }} />
                  <div className="w-4 h-4 rounded-sm border border-gray-300" style={{ backgroundColor: opt.colors[1] }} />
                </div>
                <span className="text-xs text-gray-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">页面设置</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>页边距</span>
                <span>{theme.pageMargin}mm</span>
              </div>
              <input
                type="range"
                min="10"
                max="30"
                value={theme.pageMargin}
                onChange={(e) => updateTheme({ pageMargin: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>行间距</span>
                <span>{theme.lineSpacing.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="1.2"
                max="2.4"
                step="0.1"
                value={theme.lineSpacing}
                onChange={(e) => updateTheme({ lineSpacing: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>


          </div>
        </div>

        {/* Watermark Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center justify-between">
            <span>水印设置</span>
            <button
              onClick={() => uiDispatch({ type: 'SET_WATERMARK', payload: { enabled: !theme.watermark.enabled } })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${theme.watermark.enabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${theme.watermark.enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'}`}
              />
            </button>
          </h4>
          {theme.watermark.enabled && (
            <div className="space-y-3">
              {/* 水印内容 */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">水印内容</label>
                <input
                  type="text"
                  value={theme.watermark.content}
                  onChange={(e) => uiDispatch({ type: 'SET_WATERMARK', payload: { content: e.target.value } })}
                  placeholder="输入水印文字..."
                  maxLength={20}
                  className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors"
                />
              </div>

              {/* 透明度 */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>透明度</span>
                  <span>{Math.round(theme.watermark.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.03"
                  max="0.3"
                  step="0.01"
                  value={theme.watermark.opacity}
                  onChange={(e) => uiDispatch({ type: 'SET_WATERMARK', payload: { opacity: Number(e.target.value) } })}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 字体大小 */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>字体大小</span>
                  <span>{theme.watermark.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="48"
                  step="1"
                  value={theme.watermark.fontSize}
                  onChange={(e) => uiDispatch({ type: 'SET_WATERMARK', payload: { fontSize: Number(e.target.value) } })}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 水印密度 */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">水印密度</label>
                <div className="flex gap-1.5">
                  {([
                    { value: 'low' as const, label: '稀疏' },
                    { value: 'medium' as const, label: '适中' },
                    { value: 'high' as const, label: '密集' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => uiDispatch({ type: 'SET_WATERMARK', payload: { density: opt.value } })}
                      className={`flex-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        theme.watermark.density === opt.value
                          ? 'border-blue-300 bg-blue-50 text-blue-600'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 旋转角度 */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>旋转角度</span>
                  <span>{theme.watermark.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-90"
                  max="0"
                  step="5"
                  value={theme.watermark.rotation}
                  onChange={(e) => uiDispatch({ type: 'SET_WATERMARK', payload: { rotation: Number(e.target.value) } })}
                  className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* 颜色选择 */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">水印颜色</label>
                <div className="flex items-center gap-2">
                  {['#9CA3AF', '#6B7280', '#EF4444', '#3B82F6', '#10B981'].map((c) => (
                    <button
                      key={c}
                      onClick={() => uiDispatch({ type: 'SET_WATERMARK', payload: { color: c } })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${theme.watermark.color === c ? 'border-blue-500 scale-110' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">导出选项</h4>
          <div className="space-y-3">
            {/* PDF 导出清晰度 */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>导出清晰度</span>
                <span>{theme.exportScale}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={theme.exportScale}
                onChange={(e) => updateTheme({ exportScale: Number(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="relative flex justify-between text-[10px] mt-0.5">
                <span className={theme.exportScale === 1 ? 'text-blue-500 font-medium' : 'text-gray-400'}>快速</span>
                <span className={`absolute left-[37.5%] -translate-x-1/2 ${theme.exportScale === 2.5 ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>默认</span>
                <span className={theme.exportScale === 5 ? 'text-blue-500 font-medium' : 'text-gray-400'}>高清</span>
              </div>
            </div>

            <button
              onClick={() => {
                // Reuse the export from parent - we handle it through PreviewPanel
                const exportBtn = document.querySelector('[data-export-pdf]') as HTMLButtonElement;
                if (exportBtn) exportBtn.click();
              }}
              className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <div className="text-xs font-medium text-gray-700 group-hover:text-blue-600">导出 PDF</div>
                <div className="text-xs text-gray-400">高清 A4 格式</div>
              </div>
            </button>


          </div>
        </div>

        {/* Reset */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">样式重置</h4>
          <button
            onClick={handleResetStyle}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all text-xs font-medium"
            title="恢复主题、边距、字体等样式配置为默认值"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重置文档设置
          </button>
        </div>
      </div>
    </div>
  );
}
