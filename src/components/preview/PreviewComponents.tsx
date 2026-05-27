import React, { useRef, useState, useLayoutEffect, useMemo } from 'react';
import { useResume, useAppUI } from '../../context/ResumeContext';
import { SectionKey, WatermarkSettings } from '../../types/resume';
import { parseBoldFragments } from '../../utils/markdown';

/** 将 mm 换算为 CSS 像素（96dpi） */
const MM_TO_PX = 3.779527559;
const A4_HEIGHT_MM = 297;

/** 根据已测得的 section 高度数组，计算分页 */
function computePages(
  heights: number[],
  pageMargin: number,
): number[][] {
  const availableHeight = (A4_HEIGHT_MM - pageMargin * 2) * MM_TO_PX;

  const pages: number[][] = [];
  let currentPage: number[] = [];
  let currentHeight = 0;

  for (let i = 0; i < heights.length; i++) {
    if (heights[i] === 0) continue; // 空模块不占高度

    if (currentHeight + heights[i] > availableHeight && currentPage.length > 0) {
      // 当前页放不下此模块，开启新页
      pages.push(currentPage);
      currentPage = [i];
      currentHeight = heights[i];
    } else {
      currentPage.push(i);
      currentHeight += heights[i];
    }
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

/** 渲染带格式化标记的文本，支持 **加粗**、*斜体*、***加粗+斜体*** */
export function BoldText({ text }: { text: string }) {
  if (!text) return null;
  const fragments = parseBoldFragments(text);
  return (
    <>
      {fragments.map((frag, i) => {
        if (frag.bold && frag.italic) {
          return (
            <strong key={i}>
              <em>{frag.text}</em>
            </strong>
          );
        }
        if (frag.bold) {
          return <strong key={i}>{frag.text}</strong>;
        }
        if (frag.italic) {
          return <em key={i}>{frag.text}</em>;
        }
        return <React.Fragment key={i}>{frag.text}</React.Fragment>;
      })}
    </>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <div className="section-header select-none">
      <span className="section-header-bar" />
      <span>{title}</span>
    </div>
  );
}

function useSectionClick(sectionKey: SectionKey) {
  const { uiDispatch } = useAppUI();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    uiDispatch({ type: 'SET_ACTIVE_SECTION', payload: sectionKey });
  };

  return handleClick;
}

function ActiveSectionWrapper({
  sectionKey,
  children,
  className = '',
}: {
  sectionKey: SectionKey;
  children: React.ReactNode;
  className?: string;
}) {
  const handleClick = useSectionClick(sectionKey);

  return (
    <div
      onClick={handleClick}
      className={`cursor-pointer rounded-md ${className}`}
      title={`点击编辑"${sectionKey}"模块`}
    >
      {children}
    </div>
  );
}

export function PersonalInfoPreview() {
  const { data } = useResume();
  const { personalInfo } = data;

  return (
    <ActiveSectionWrapper sectionKey="personal" className="mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-[28px] font-bold text-gray-900 mb-3">
            {personalInfo.fullName || '你的姓名'}
          </h1>
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{personalInfo.phone || '电话'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{personalInfo.email || '邮箱'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {personalInfo.tags.filter(Boolean).map((tag, i) => (
              <span
                key={i}
                className="inline-block px-3 py-1 tag-badge text-xs font-medium select-text"
                style={{ borderRadius: '2px' }}
                data-section="personal"
                data-field="tags"
                data-tag-index={i}
              >
                <BoldText text={tag} />
              </span>
            ))}
          </div>
        </div>
        <div className="w-[100px] h-[130px] rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 ml-6">
          {personalInfo.photoUrl ? (
            <img
              src={personalInfo.photoUrl}
              alt="证件照"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </ActiveSectionWrapper>
  );
}

export function EducationPreview() {
  const { data } = useResume();

  if (data.education.length === 0) return null;

  return (
    <ActiveSectionWrapper sectionKey="education" className="mb-5">
      <SectionHeader title="教育经历" />
      {data.education.map((edu) => (
        <div key={edu.id} className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-[14px] text-gray-900">{edu.school || '学校名称'}</span>
              <span className="text-gray-500 text-sm ml-2">{edu.major}</span>
              {edu.degree && <span className="text-gray-400 text-sm ml-2">· {edu.degree}</span>}
            </div>
            <span className="text-sm text-gray-500">
              {edu.startDate} - {edu.endDate}
            </span>
          </div>

        </div>
      ))}
    </ActiveSectionWrapper>
  );
}

export function SkillsPreview() {
  const { data } = useResume();

  if (data.skills.length === 0) return null;

  return (
    <ActiveSectionWrapper sectionKey="skills" className="mb-5">
      <SectionHeader title="专业技能" />
      <ul className="list-none space-y-1">
        {data.skills.filter(Boolean).map((item, i) => (
          <li key={i} className="flex items-baseline gap-1.5 text-sm text-gray-700">
            <span className="text-gray-400 shrink-0 w-[22px] text-right select-none">{i + 1}.</span>
            <span
              className="break-words select-text"
              data-section="skills"
              data-skill-index={i}
            >
              <BoldText text={item} />
            </span>
          </li>
        ))}
      </ul>
    </ActiveSectionWrapper>
  );
}

export function WorkExperiencePreview() {
  const { data } = useResume();

  if (data.workExperience.length === 0) return null;

  return (
    <ActiveSectionWrapper sectionKey="work" className="mb-5">
      <SectionHeader title="工作经历" />
      {data.workExperience.map((work) => (
        <div key={work.id} className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-bold text-[14px] text-gray-900">{work.company || '公司名称'}</span>
              <span className="text-gray-500 text-sm ml-2">{work.position}</span>
              {work.location && <span className="text-gray-400 text-sm ml-2">· {work.location}</span>}
            </div>
            <span className="text-sm text-gray-500">
              {work.startDate} - {work.endDate}
            </span>
          </div>
          {work.highlights.filter(Boolean).length > 0 && (
            <ul className="list-none space-y-1">
              {work.highlights.filter(Boolean).map((h, i) => (
                <li key={i} className="flex items-baseline gap-1.5 text-sm text-gray-700">
                  <span className="text-gray-400 shrink-0 w-[22px] text-right select-none">{i + 1}.</span>
                  <span
                    className="break-words select-text"
                    data-section="work"
                    data-entry-id={work.id}
                    data-highlight-index={i}
                  >
                    <BoldText text={h} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </ActiveSectionWrapper>
  );
}

export function ProjectPreview() {
  const { data } = useResume();

  if (data.projects.length === 0) return null;

  return (
    <ActiveSectionWrapper sectionKey="projects" className="mb-5">
      <SectionHeader title="项目经历" />
      {data.projects.map((proj) => (
        <div key={proj.id} className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-bold text-[14px] text-gray-900">{proj.name || '项目名称'}</span>
              <span className="text-gray-500 text-sm ml-2">{proj.role}</span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>{proj.startDate} - {proj.endDate}</div>
              {proj.link && (
                <div className="text-blue-500 text-xs">{proj.link}</div>
              )}
            </div>
          </div>
          {proj.highlights.filter(Boolean).length > 0 && (
            <ul className="list-none space-y-1">
              {proj.highlights.filter(Boolean).map((h, i) => (
                <li key={i} className="flex items-baseline gap-1.5 text-sm text-gray-700">
                  <span className="text-gray-400 shrink-0 w-[22px] text-right select-none">{i + 1}.</span>
                  <span
                    className="break-words select-text"
                    data-section="projects"
                    data-entry-id={proj.id}
                    data-highlight-index={i}
                  >
                    <BoldText text={h} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </ActiveSectionWrapper>
  );
}

/** 水印覆盖层：在纸张上平铺倾斜的半透明文字 */
function WatermarkOverlay({ settings }: { settings: WatermarkSettings }) {
  const cells = useMemo(() => {
    const densityMap = {
      low: { cols: 3, rows: 3 },
      medium: { cols: 4, rows: 4 },
      high: { cols: 5, rows: 6 },
    };
    const { cols, rows } = densityMap[settings.density];
    const result: { x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        result.push({
          x: (c * 100) / Math.max(cols - 1, 1),
          y: (r * 100) / Math.max(rows - 1, 1),
        });
      }
    }
    return result;
  }, [settings.density]);

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 0 }}
    >
      {cells.map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: `translate(-50%, -50%) rotate(${settings.rotation}deg)`,
            fontSize: `${settings.fontSize}px`,
            color: settings.color,
            opacity: settings.opacity,
            fontWeight: 600,
            whiteSpace: 'nowrap',
          }}
        >
          {settings.content}
        </div>
      ))}
    </div>
  );
}

export function ResumePreview() {
  const { ui } = useAppUI();
  const { data } = useResume();
  const { theme } = ui;

  const [needsMeasure, setNeedsMeasure] = useState(true);
  const [pages, setPages] = useState<number[][]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const colorMap: Record<string, { bg: string; border: string; tagBg: string; tagText: string }> = {
    blue: { bg: '#DBEAFE', border: '#3B82F6', tagBg: '#EFF6FF', tagText: '#2563EB' },
    gray: { bg: '#F3F4F6', border: '#6B7280', tagBg: '#F9FAFB', tagText: '#4B5563' },
    black: { bg: '#E5E7EB', border: '#374151', tagBg: '#F3F4F6', tagText: '#1F2937' },
  };

  const colors = colorMap[theme.colorTheme] || colorMap.blue;

  // 数据或主题变更时，标记需要重新测量（不清空 pages，避免闪烁）
  const prevDepKey = useRef('');
  useLayoutEffect(() => {
    const depKey = JSON.stringify(data) + '|' + theme.pageMargin + '|' + theme.lineSpacing;
    if (depKey !== prevDepKey.current) {
      prevDepKey.current = depKey;
      setNeedsMeasure(true);
      // 不再 setPages([]) —— 保留旧布局在屏幕上，用离屏元素做测量
    }
  }, [data, theme.pageMargin, theme.lineSpacing]);

  // 执行测量并计算分页
  useLayoutEffect(() => {
    if (!needsMeasure) return;

    const raf = requestAnimationFrame(() => {
      const heights = sectionRefs.current
        .filter(Boolean)
        .map(el => el!.offsetHeight);
      const newPages = computePages(heights, theme.pageMargin);
      setPages(newPages);
      setNeedsMeasure(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [needsMeasure, theme.pageMargin]);

  const sectionInfos = [
    { key: 'personal', component: <PersonalInfoPreview /> },
    { key: 'education', component: <EducationPreview /> },
    { key: 'skills', component: <SkillsPreview /> },
    { key: 'work', component: <WorkExperiencePreview /> },
    { key: 'projects', component: <ProjectPreview /> },
  ];

  const paperStyle: React.CSSProperties = {
    padding: `${theme.pageMargin}mm`,
    lineHeight: theme.lineSpacing,
    fontSize: '13px',
  };

  const colorStyle = `
    .resume-paper .section-header {
      background-color: ${colors.bg} !important;
    }
    .resume-paper .section-header-bar {
      background-color: ${colors.border} !important;
    }
    .resume-paper .tag-badge {
      background-color: ${colors.tagBg} !important;
      color: ${colors.tagText} !important;
    }
  `;

  const isMultiPage = pages.length > 1;

  const watermarkEl = theme.watermark.enabled ? (
    <WatermarkOverlay settings={theme.watermark} />
  ) : null;

  // 离屏隐藏测量元素（重测量时用，不干扰可见布局）
  const hiddenMeasureEl = needsMeasure && isMultiPage ? (
    <div
      key="hidden-measure"
      style={{
        position: 'fixed',
        top: 0,
        left: '-9999px',
        visibility: 'hidden',
      }}
      aria-hidden="true"
    >
      <div className="resume-paper" style={{ ...paperStyle, position: 'relative', overflow: 'hidden' }}>
        <style>{colorStyle}</style>
        {watermarkEl}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {sectionInfos.map((s, i) => (
            <div key={s.key} ref={el => { sectionRefs.current[i] = el; }}>
              {s.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  // ========== 多页模式 ==========
  if (isMultiPage) {
    return (
      <>
        {hiddenMeasureEl}
        <div className="resume-pages-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
          <style>{colorStyle}</style>
          {pages.map((pageIndices, pageIndex) => (
            <div
              key={pageIndex}
              className="resume-paper"
              style={{
                ...paperStyle,
                height: `${A4_HEIGHT_MM}mm`,
                overflow: 'hidden',
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {theme.watermark.enabled && <WatermarkOverlay settings={theme.watermark} />}
              <div style={{ position: 'relative', zIndex: 1 }}>
                {pageIndices.map(i => (
                  <React.Fragment key={sectionInfos[i].key}>
                    {sectionInfos[i].component}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ========== 单页 / 初始测量模式 ==========
  return (
    <div className="resume-paper" style={{ ...paperStyle, position: 'relative', overflow: 'hidden' }}>
      <style>{colorStyle}</style>
      {theme.watermark.enabled && <WatermarkOverlay settings={theme.watermark} />}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {sectionInfos.map((s, i) => (
          <div key={s.key} ref={el => { sectionRefs.current[i] = el; }}>
            {s.component}
          </div>
        ))}
      </div>
    </div>
  );
}
