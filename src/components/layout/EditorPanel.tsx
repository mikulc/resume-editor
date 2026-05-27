import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PersonalInfoEditor, EducationEditor, SkillsEditor, WorkExperienceEditor, ProjectEditor } from '../editor/EditorComponents';
import { useResume, useAppUI } from '../../context/ResumeContext';
import { SectionKey, ThemeSettings } from '../../types/resume';
import { useConfirm } from '../common/ConfirmModal';
import { useToast } from '../common/Toast';

// 主题色映射：根据 colorTheme 返回编辑器面板的 accent 样式类
function getAccentClasses(colorTheme: ThemeSettings['colorTheme']) {
  const map = {
    blue: {
      activeBorder: 'border-blue-400/60',
      activeRing: 'ring-blue-400/30',
      activeShadow: 'shadow-blue-500/10',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-600',
      accentBar: 'bg-blue-500',
      accentBarShadow: 'shadow-blue-400/40',
      activeTitle: 'text-blue-600',
    },
    gray: {
      activeBorder: 'border-gray-400/60',
      activeRing: 'ring-gray-400/30',
      activeShadow: 'shadow-gray-500/10',
      badgeBg: 'bg-gray-100',
      badgeText: 'text-gray-600',
      accentBar: 'bg-gray-500',
      accentBarShadow: 'shadow-gray-400/40',
      activeTitle: 'text-gray-600',
    },
    black: {
      activeBorder: 'border-gray-500/60',
      activeRing: 'ring-gray-500/30',
      activeShadow: 'shadow-gray-600/10',
      badgeBg: 'bg-gray-200',
      badgeText: 'text-gray-700',
      accentBar: 'bg-gray-700',
      accentBarShadow: 'shadow-gray-600/40',
      activeTitle: 'text-gray-700',
    },
  } as const;
  return map[colorTheme];
}

interface SectionWrapperProps {
  sectionKey: SectionKey;
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectionWrapper({ sectionKey, title, children, isExpanded, onToggle }: SectionWrapperProps) {
  const { ui, uiDispatch } = useAppUI();
  const isActive = ui.activeSection === sectionKey;
  const ref = useRef<HTMLDivElement>(null);
  const accent = getAccentClasses(ui.theme.colorTheme);

  // 预览区点击联动 → 自动展开对应模块
  useEffect(() => {
    if (isActive && !isExpanded) {
      onToggle();
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // 模块成为 active 时滚动到视口
  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isActive]);

  const handleClick = () => {
    onToggle();
    // 点击模块时联动跳到预览对应位置
    uiDispatch({ type: 'SET_ACTIVE_SECTION', payload: sectionKey });
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
        isActive
          ? `${accent.activeBorder} ring-1 ${accent.activeRing} shadow-lg ${accent.activeShadow}`
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-1 h-5 rounded-full transition-colors duration-300 ${
            isActive ? `${accent.accentBar} shadow-sm ${accent.accentBarShadow}` : 'bg-gray-300'
          }`} />
          <h3 className={`font-semibold text-sm transition-colors duration-300 ${
            isActive ? accent.activeTitle : 'text-gray-700'
          }`}>
            {title}
          </h3>
          {isActive && (
            <span className={`px-1.5 py-0.5 rounded-md ${accent.badgeBg} ${accent.badgeText} text-[10px] font-medium`}>
              预览中
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {/* 展开/收起动画：max-height + overflow-hidden 实现平滑过渡 */}
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: isExpanded ? '2000px' : '0px',
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export function EditorPanel() {
  const { dispatch } = useResume();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  // 手风琴模式：默认展开"个人信息"，点击同一模块可收回，同一时间最多展开一个
  const [expandedSection, setExpandedSection] = useState<SectionKey | null>('personal');

  const handleToggleSection = useCallback((sectionKey: SectionKey) => {
    setExpandedSection((prev) => {
      // 点击已展开模块 → 收回；点击其他模块 → 切换展开
      return prev === sectionKey ? null : sectionKey;
    });
  }, []);

  const sectionList: { key: SectionKey; title: string; Editor: React.ComponentType }[] = [
    { key: 'personal', title: '个人信息', Editor: PersonalInfoEditor },
    { key: 'education', title: '教育经历', Editor: EducationEditor },
    { key: 'skills', title: '专业技能', Editor: SkillsEditor },
    { key: 'work', title: '工作/实习经历', Editor: WorkExperienceEditor },
    { key: 'projects', title: '项目经历', Editor: ProjectEditor },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div>
          <h2 className="text-gray-800 font-semibold text-sm">编辑面板</h2>
          <p className="text-gray-400 text-xs">填写简历信息</p>
        </div>
        <button
          onClick={async () => {
            const confirmed = await confirm({
              title: '重置简历信息',
              message: '确定要重置所有简历信息吗？您当前填写的所有简历内容将恢复为模板初始状态，此操作可通过Ctrl+Z撤销。',
              confirmText: '确认重置',
              cancelText: '取消',
              confirmVariant: 'danger',
            });
            if (confirmed) {
              dispatch({ type: 'RESET_DATA' });
              showToast('简历信息已重置');
            }
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          title="重置简历信息，恢复模板初始内容"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Scrollable Section List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 scroll-smooth hide-scrollbar scroll-pt-5">
        {sectionList.map(({ key, title, Editor }) => (
          <SectionWrapper
            key={key}
            sectionKey={key}
            title={title}
            isExpanded={expandedSection === key}
            onToggle={() => handleToggleSection(key)}
          >
            <Editor />
          </SectionWrapper>
        ))}
      </div>
    </div>
  );
}
