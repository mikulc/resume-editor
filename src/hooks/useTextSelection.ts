import { useState, useCallback, useRef, useEffect } from 'react';
import { useResume } from '../context/ResumeContext';
import {
  buildOffsetMap,
  getRenderedOffset,
  toggleBoldAtPosition,
  toggleItalicAtPosition,
  clearFormatAtPosition,
} from '../utils/markdown';

export interface SelectionState {
  /** 选区在视口中的位置（用于定位工具栏） */
  rect: DOMRect | null;
  /** 选中的纯文本 */
  text: string;
  /** 数据来源 section */
  section: 'personal' | 'education' | 'skills' | 'work' | 'projects';
  /** 条目 ID */
  entryId: string;
  /** 字段名 */
  field: string;
  /** 附加索引信息 */
  indexInfo?: { highlightIndex?: number; tagIndex?: number; skillIndex?: number };
  /** 选区在源文本（含 ** 标记）中的起始偏移 */
  sourceStart: number;
  /** 选区在源文本（含 ** 标记）中的结束偏移 */
  sourceEnd: number;
}

/** 从 DOM 节点向上查找可编辑文本元素，返回数据属性 + 元素引用 */
function findEditableAncestor(node: Node | null): {
  section: string;
  entryId: string;
  field: string;
  highlightIndex?: number;
  tagIndex?: number;
  skillIndex?: number;
  /** 可编辑容器元素（用于位置映射） */
  element: HTMLElement;
} | null {
  let current: Node | null = node;
  while (current) {
    if (current.nodeType !== Node.ELEMENT_NODE) {
      current = current.parentNode;
      continue;
    }
    const el = current as HTMLElement;
    const section = el.dataset.section;
    if (!section) {
      current = current.parentNode;
      continue;
    }

    let field = el.dataset.field || 'text';
    if (el.dataset.highlightIndex !== undefined) {
      field = 'highlights';
    } else if (el.dataset.tagIndex !== undefined) {
      field = 'tags';
    } else if (el.dataset.skillIndex !== undefined) {
      field = 'items';
    }

    const entryId = el.dataset.entryId || section;

    return {
      section,
      entryId,
      field,
      highlightIndex: el.dataset.highlightIndex !== undefined ? parseInt(el.dataset.highlightIndex) : undefined,
      tagIndex: el.dataset.tagIndex !== undefined ? parseInt(el.dataset.tagIndex) : undefined,
      skillIndex: el.dataset.skillIndex !== undefined ? parseInt(el.dataset.skillIndex) : undefined,
      element: el,
    };
  }
  return null;
}

export function useTextSelection(containerRef: React.RefObject<HTMLElement | null>) {
  const { data, dispatch } = useResume();
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  // 防抖：防止快速连续点击
  const processingRef = useRef(false);

  /** 关闭工具栏 */
  const closeToolbar = useCallback(() => {
    setShowToolbar(false);
    setSelection(null);
    // 清除选区
    window.getSelection()?.removeAllRanges();
  }, []);

  /** 处理 mouseup 事件 */
  const handleMouseUp = useCallback(() => {
    if (processingRef.current) return;

    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setShowToolbar(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const selectedText = sel.toString().trim();

      if (!selectedText) {
        setShowToolbar(false);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      if (!container.contains(range.startContainer)) {
        setShowToolbar(false);
        return;
      }

      const editableInfo = findEditableAncestor(range.startContainer);
      if (!editableInfo) {
        setShowToolbar(false);
        return;
      }

      // 教育经历不弹出工具栏
      if (editableInfo.section === 'education') {
        setShowToolbar(false);
        return;
      }

      const endInfo = findEditableAncestor(range.endContainer);
      if (
        !endInfo ||
        endInfo.entryId !== editableInfo.entryId ||
        endInfo.section !== editableInfo.section ||
        endInfo.field !== editableInfo.field
      ) {
        setShowToolbar(false);
        return;
      }

      if (
        (editableInfo.highlightIndex !== undefined && editableInfo.highlightIndex !== endInfo.highlightIndex) ||
        (editableInfo.tagIndex !== undefined && editableInfo.tagIndex !== endInfo.tagIndex) ||
        (editableInfo.skillIndex !== undefined && editableInfo.skillIndex !== endInfo.skillIndex)
      ) {
        setShowToolbar(false);
        return;
      }

      // ---- 基于 DOM 位置计算源文本偏移（替代文本搜索，避免错位） ----
      const containerEl = editableInfo.element;

      // 计算选区起止点在容器渲染文本中的字符偏移
      const renderedStart = getRenderedOffset(containerEl, range.startContainer, range.startOffset);
      const renderedEnd = getRenderedOffset(containerEl, range.endContainer, range.endOffset);

      // 建立"渲染偏移 → 源文本偏移"映射
      const offsetMap = buildOffsetMap(containerEl);
      if (offsetMap.length === 0) {
        setShowToolbar(false);
        return;
      }

      // 查找映射，将渲染偏移转为源文本偏移
      let sourceStart = -1;
      let sourceEnd = -1;
      for (const entry of offsetMap) {
        if (entry.renderedOffset === renderedStart && sourceStart === -1) {
          sourceStart = entry.sourceOffset;
        }
        if (entry.renderedOffset === renderedEnd - 1) {
          // end 是排他边界，源文本中取最后一个字符的下一个位置
          sourceEnd = entry.sourceOffset + 1;
        }
      }
      // 处理终点在文本末尾的情况
      if (renderedEnd >= offsetMap.length) {
        sourceEnd = offsetMap[offsetMap.length - 1].sourceOffset + 1;
      }
      if (sourceStart === -1 || sourceEnd === -1 || sourceStart >= sourceEnd) {
        setShowToolbar(false);
        return;
      }

      const rect = range.getBoundingClientRect();

      setSelection({
        rect,
        text: selectedText,
        section: editableInfo.section as SelectionState['section'],
        entryId: editableInfo.entryId,
        field: editableInfo.field,
        indexInfo: {
          highlightIndex: editableInfo.highlightIndex,
          tagIndex: editableInfo.tagIndex,
          skillIndex: editableInfo.skillIndex,
        },
        sourceStart,
        sourceEnd,
      });
      setShowToolbar(true);
    }, 10);
  }, [containerRef]);

  /** 切换加粗（基于源文本精确偏移量，从根本上避免错位） */
  const handleToggleBold = useCallback(() => {
    if (!selection || processingRef.current) return;

    processingRef.current = true;
    const { section, entryId, indexInfo, field, sourceStart, sourceEnd } = selection;

    // 根据 section 和 field 查找原始数据
    let sourceText = '';
    switch (section) {
      case 'work': {
        const work = data.workExperience.find((w) => w.id === entryId);
        if (work && indexInfo?.highlightIndex !== undefined) {
          sourceText = work.highlights[indexInfo.highlightIndex] || '';
        }
        break;
      }
      case 'projects': {
        const proj = data.projects.find((p) => p.id === entryId);
        if (proj && indexInfo?.highlightIndex !== undefined) {
          sourceText = proj.highlights[indexInfo.highlightIndex] || '';
        }
        break;
      }
      case 'skills': {
        if (indexInfo?.skillIndex !== undefined) {
          sourceText = data.skills[indexInfo.skillIndex] || '';
        }
        break;
      }
      // toggleBold - education
      case 'education': {
        const edu = data.education.find((e) => e.id === entryId);
        if (edu && field === 'courses') {
          sourceText = edu.courses || '';
        }
        break;
      }
      // toggleBold - personal
      case 'personal': {
        if (field === 'tags' && indexInfo?.tagIndex !== undefined) {
          sourceText = data.personalInfo.tags[indexInfo.tagIndex] || '';
        }
        break;
      }
    }

    if (!sourceText) {
      processingRef.current = false;
      return;
    }

    // 基于偏移量精准操作（不再用文本搜索）
    const newText = toggleBoldAtPosition(sourceText, sourceStart, sourceEnd);
    if (newText === sourceText) {
      processingRef.current = false;
      return;
    }

    // 分发对应的 action
    switch (section) {
      case 'work':
        if (indexInfo?.highlightIndex !== undefined) {
          dispatch({
            type: 'UPDATE_WORK_HIGHLIGHT',
            payload: { workId: entryId, index: indexInfo.highlightIndex, highlight: newText },
          });
        }
        break;
      case 'projects':
        if (indexInfo?.highlightIndex !== undefined) {
          dispatch({
            type: 'UPDATE_PROJECT_HIGHLIGHT',
            payload: { projectId: entryId, index: indexInfo.highlightIndex, highlight: newText },
          });
        }
        break;
      case 'skills':
        if (indexInfo?.skillIndex !== undefined) {
          dispatch({
            type: 'UPDATE_SKILL',
            payload: { index: indexInfo.skillIndex, item: newText },
          });
        }
        break;
      case 'education': {
        const edu = data.education.find((e) => e.id === entryId);
        if (edu && field === 'courses') {
          dispatch({
            type: 'UPDATE_EDUCATION',
            payload: { ...edu, courses: newText },
          });
        }
        break;
      }
      case 'personal': {
        if (field === 'tags' && indexInfo?.tagIndex !== undefined) {
          const newTags = [...data.personalInfo.tags];
          newTags[indexInfo.tagIndex] = newText;
          dispatch({
            type: 'SET_PERSONAL_INFO',
            payload: { tags: newTags },
          });
        }
        break;
      }
    }

    closeToolbar();
    setTimeout(() => {
      processingRef.current = false;
    }, 200);
  }, [selection, data, dispatch, closeToolbar]);

  /** 切换斜体（基于源文本精确偏移量） */
  const handleToggleItalic = useCallback(() => {
    if (!selection || processingRef.current) return;

    processingRef.current = true;
    const { section, entryId, indexInfo, field, sourceStart, sourceEnd } = selection;

    // 根据 section 和 field 查找原始数据
    let sourceText = '';
    switch (section) {
      case 'work': {
        const work = data.workExperience.find((w) => w.id === entryId);
        if (work && indexInfo?.highlightIndex !== undefined) {
          sourceText = work.highlights[indexInfo.highlightIndex] || '';
        }
        break;
      }
      case 'projects': {
        const proj = data.projects.find((p) => p.id === entryId);
        if (proj && indexInfo?.highlightIndex !== undefined) {
          sourceText = proj.highlights[indexInfo.highlightIndex] || '';
        }
        break;
      }
      case 'skills': {
        if (indexInfo?.skillIndex !== undefined) {
          sourceText = data.skills[indexInfo.skillIndex] || '';
        }
        break;
      }
      case 'education': {
        const edu = data.education.find((e) => e.id === entryId);
        if (edu && field === 'courses') {
          sourceText = edu.courses || '';
        }
        break;
      }
      case 'personal': {
        if (field === 'tags' && indexInfo?.tagIndex !== undefined) {
          sourceText = data.personalInfo.tags[indexInfo.tagIndex] || '';
        }
        break;
      }
    }

    if (!sourceText) {
      processingRef.current = false;
      return;
    }

    const newText = toggleItalicAtPosition(sourceText, sourceStart, sourceEnd);
    if (newText === sourceText) {
      processingRef.current = false;
      return;
    }

    // 分发对应的 action（与加粗一致的数据更新路径）
    switch (section) {
      case 'work':
        if (indexInfo?.highlightIndex !== undefined) {
          dispatch({
            type: 'UPDATE_WORK_HIGHLIGHT',
            payload: { workId: entryId, index: indexInfo.highlightIndex, highlight: newText },
          });
        }
        break;
      case 'projects':
        if (indexInfo?.highlightIndex !== undefined) {
          dispatch({
            type: 'UPDATE_PROJECT_HIGHLIGHT',
            payload: { projectId: entryId, index: indexInfo.highlightIndex, highlight: newText },
          });
        }
        break;
      case 'skills':
        if (indexInfo?.skillIndex !== undefined) {
          dispatch({
            type: 'UPDATE_SKILL',
            payload: { index: indexInfo.skillIndex, item: newText },
          });
        }
        break;
      case 'education': {
        const edu = data.education.find((e) => e.id === entryId);
        if (edu && field === 'courses') {
          dispatch({
            type: 'UPDATE_EDUCATION',
            payload: { ...edu, courses: newText },
          });
        }
        break;
      }
      case 'personal': {
        if (field === 'tags' && indexInfo?.tagIndex !== undefined) {
          const newTags = [...data.personalInfo.tags];
          newTags[indexInfo.tagIndex] = newText;
          dispatch({
            type: 'SET_PERSONAL_INFO',
            payload: { tags: newTags },
          });
        }
        break;
      }
    }

    closeToolbar();
    setTimeout(() => {
      processingRef.current = false;
    }, 200);
  }, [selection, data, dispatch, closeToolbar]);

  /** 清除格式：移除选中区域内所有 ** 和 * 标记 */
  const handleClearFormat = useCallback(() => {
    if (!selection || processingRef.current) return;

    processingRef.current = true;
    const { section, entryId, indexInfo, field, sourceStart, sourceEnd } = selection;

    // 根据 section 和 field 查找原始数据
    let sourceText = '';
    switch (section) {
      case 'work': {
        const work = data.workExperience.find((w) => w.id === entryId);
        if (work && indexInfo?.highlightIndex !== undefined) {
          sourceText = work.highlights[indexInfo.highlightIndex] || '';
        }
        break;
      }
      case 'projects': {
        const proj = data.projects.find((p) => p.id === entryId);
        if (proj && indexInfo?.highlightIndex !== undefined) {
          sourceText = proj.highlights[indexInfo.highlightIndex] || '';
        }
        break;
      }
      case 'skills': {
        if (indexInfo?.skillIndex !== undefined) {
          sourceText = data.skills[indexInfo.skillIndex] || '';
        }
        break;
      }
      case 'education': {
        const edu = data.education.find((e) => e.id === entryId);
        if (edu && field === 'courses') {
          sourceText = edu.courses || '';
        }
        break;
      }
      case 'personal': {
        if (field === 'tags' && indexInfo?.tagIndex !== undefined) {
          sourceText = data.personalInfo.tags[indexInfo.tagIndex] || '';
        }
        break;
      }
    }

    if (!sourceText) {
      processingRef.current = false;
      return;
    }

    const newText = clearFormatAtPosition(sourceText, sourceStart, sourceEnd);
    if (newText === sourceText) {
      processingRef.current = false;
      return;
    }

    // 分发对应的 action
    switch (section) {
      case 'work':
        if (indexInfo?.highlightIndex !== undefined) {
          dispatch({
            type: 'UPDATE_WORK_HIGHLIGHT',
            payload: { workId: entryId, index: indexInfo.highlightIndex, highlight: newText },
          });
        }
        break;
      case 'projects':
        if (indexInfo?.highlightIndex !== undefined) {
          dispatch({
            type: 'UPDATE_PROJECT_HIGHLIGHT',
            payload: { projectId: entryId, index: indexInfo.highlightIndex, highlight: newText },
          });
        }
        break;
      case 'skills':
        if (indexInfo?.skillIndex !== undefined) {
          dispatch({
            type: 'UPDATE_SKILL',
            payload: { index: indexInfo.skillIndex, item: newText },
          });
        }
        break;
      case 'education': {
        const edu = data.education.find((e) => e.id === entryId);
        if (edu && field === 'courses') {
          dispatch({
            type: 'UPDATE_EDUCATION',
            payload: { ...edu, courses: newText },
          });
        }
        break;
      }
      case 'personal': {
        if (field === 'tags' && indexInfo?.tagIndex !== undefined) {
          const newTags = [...data.personalInfo.tags];
          newTags[indexInfo.tagIndex] = newText;
          dispatch({
            type: 'SET_PERSONAL_INFO',
            payload: { tags: newTags },
          });
        }
        break;
      }
    }

    closeToolbar();
    setTimeout(() => {
      processingRef.current = false;
    }, 200);
  }, [selection, data, dispatch, closeToolbar]);

  /** 点击预览区空白处关闭工具栏 */
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!showToolbar) return;
      const target = e.target as HTMLElement;
      // 如果点击的不是工具栏按钮，关闭
      if (!target.closest('[data-toolbar]')) {
        closeToolbar();
      }
    },
    [showToolbar, closeToolbar]
  );

  /** 鼠标移出预览区域外层 */
  const handleMouseLeave = useCallback(() => {
    if (showToolbar) {
      closeToolbar();
    }
  }, [showToolbar, closeToolbar]);

  // 全局点击监听（点击预览区空白位置关闭）
  useEffect(() => {
    if (showToolbar) {
      document.addEventListener('mousedown', handleClick, true);
      return () => document.removeEventListener('mousedown', handleClick, true);
    }
  }, [showToolbar, handleClick]);

  return {
    selection,
    showToolbar,
    handleMouseUp,
    handleToggleBold,
    handleToggleItalic,
    handleClearFormat,
    closeToolbar,
    handleMouseLeave,
  };
}
