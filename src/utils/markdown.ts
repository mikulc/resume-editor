/**
 * Markdown 格式化解析工具
 * 支持 **text** (加粗) / *text* (斜体) / ***text*** (加粗+斜体) ↔ HTML 标签双向转换
 */

/** 将带标记的原始文本解析为 React 可渲染的片段数组 */
export interface TextFragment {
  text: string;
  bold: boolean;
  italic: boolean;
}

/**
 * 解析格式化标记：
 * - ***text*** → bold + italic（优先匹配三重星号）
 * - **text**   → bold
 * - *text*     → italic
 * - 其余       → 普通文本
 */
export function parseBoldFragments(rawText: string): TextFragment[] {
  const fragments: TextFragment[] = [];
  // 按优先级：*** → ** → * → 普通文本
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|([^*]+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    if (match[1] !== undefined) {
      // ***text*** → bold + italic
      fragments.push({ text: match[1], bold: true, italic: true });
    } else if (match[2] !== undefined) {
      // **text** → bold only
      fragments.push({ text: match[2], bold: true, italic: false });
    } else if (match[3] !== undefined) {
      // *text* → italic only
      fragments.push({ text: match[3], bold: false, italic: true });
    } else if (match[4] !== undefined) {
      fragments.push({ text: match[4], bold: false, italic: false });
    }
  }

  if (fragments.length === 0 && rawText) {
    fragments.push({ text: rawText, bold: false, italic: false });
  }

  return fragments;
}

// ====== 基于偏移量的精准操作（替代文本搜索，避免重复文字错位） ======

/**
 * 遍历容器 DOM 子树，构建"渲染偏移 → 源文本偏移"映射。
 * 遇到 <strong> 时源文本游标 +2（跳过 **），遇到 <em> 时 +1（跳过 *），
 * 嵌套的 <strong><em> 组合使用 3 个星号（***）。
 * 普通文本节点时两游标同步。
 */
export interface OffsetMapping {
  renderedOffset: number;
  sourceOffset: number;
}

export function buildOffsetMap(containerEl: HTMLElement): OffsetMapping[] {
  const mapping: OffsetMapping[] = [];
  let sourceIdx = 0;
  let renderedIdx = 0;

  function walk(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      for (let i = 0; i < text.length; i++) {
        mapping.push({ renderedOffset: renderedIdx, sourceOffset: sourceIdx });
        renderedIdx++;
        sourceIdx++;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.tagName === 'STRONG') {
        // 检查内部第一个子元素是否为 <em>，若是则说明是 *** 组合标记
        const firstChild = el.firstChild;
        if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE && (firstChild as HTMLElement).tagName === 'EM') {
          // <strong><em>text</em></strong> → ***text***
          // 直接遍历 <em> 内部的子节点，跳过 <em> 标签本身，
          // 避免内层 <em> 重复计算 *（外层 +3 已包含全部 *** 星号）
          sourceIdx += 3; // 跳过开头的 ***
          firstChild.childNodes.forEach(walk);
          sourceIdx += 3; // 跳过结尾的 ***
        } else {
          // <strong>text</strong> → **text**
          sourceIdx += 2; // 跳过开头的 **
          node.childNodes.forEach(walk);
          sourceIdx += 2; // 跳过结尾的 **
        }
      } else if (el.tagName === 'EM') {
        // 单独的 <em>text</em> → *text*（不在 <strong> 内部的）
        sourceIdx += 1; // 跳过开头的 *
        node.childNodes.forEach(walk);
        sourceIdx += 1; // 跳过结尾的 *
      } else {
        node.childNodes.forEach(walk);
      }
    }
  }

  containerEl.childNodes.forEach(walk);
  return mapping;
}

/**
 * 计算 DOM 节点+偏移量在容器渲染文本中的字符偏移。
 * 遍历容器内所有文本节点累加字符数直至命中目标。
 */
export function getRenderedOffset(
  containerEl: HTMLElement,
  targetNode: Node,
  targetOffset: number
): number {
  let offset = 0;
  let found = false;

  function walk(node: Node): void {
    if (found) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (node === targetNode) {
        offset += Math.min(targetOffset, text.length);
        found = true;
        return;
      }
      offset += text.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.childNodes.forEach(walk);
    }
  }

  containerEl.childNodes.forEach(walk);
  return offset;
}

/** 检查源文本 [start, end) 区间是否已被 ** 包裹 */
export function isRangeBold(sourceText: string, start: number, end: number): boolean {
  return (
    start >= 2 &&
    end + 2 <= sourceText.length &&
    sourceText.substring(start - 2, start) === '**' &&
    sourceText.substring(end, end + 2) === '**'
  );
}

/** 在源文本精确偏移量处插入 ** 加粗标记 */
export function boldAtPosition(sourceText: string, start: number, end: number): string {
  if (start < 0 || end > sourceText.length || start >= end) return sourceText;
  return (
    sourceText.substring(0, start) +
    '**' +
    sourceText.substring(start, end) +
    '**' +
    sourceText.substring(end)
  );
}

/** 在源文本精确偏移量处移除 ** 加粗标记 */
export function unboldAtPosition(sourceText: string, start: number, end: number): string {
  if (start < 2 || end + 2 > sourceText.length) return sourceText;
  return (
    sourceText.substring(0, start - 2) +
    sourceText.substring(start, end) +
    sourceText.substring(end + 2)
  );
}

/** 基于偏移量切换加粗状态 */
export function toggleBoldAtPosition(
  sourceText: string,
  start: number,
  end: number
): string {
  if (isRangeBold(sourceText, start, end)) {
    return unboldAtPosition(sourceText, start, end);
  }
  return boldAtPosition(sourceText, start, end);
}

// ====== 斜体操作（基于偏移量，与加粗逻辑一致） ======

/**
 * 检查源文本 [start, end) 区间是否已被 * 包裹（斜体标记）
 * 需要排除 **（加粗）和 ***（加粗+斜体组合）的误判：
 * - *text*    → true（单星号包裹，纯斜体）
 * - **text**  → false（双星号包裹，纯加粗）
 * - ***text*** → true（三星号包裹，加粗+斜体组合，内层 * 也算斜体标记）
 */
export function isRangeItalic(sourceText: string, start: number, end: number): boolean {
  if (start < 1 || end + 1 > sourceText.length) return false;
  if (sourceText[start - 1] !== '*' || sourceText[end] !== '*') return false;

  // 左侧：检查 * 是否为独立斜体标记（非纯加粗 ** 的组成部分）
  const leftIsBoldStart =
    start >= 2 &&
    sourceText[start - 2] === '*' &&
    sourceText[start - 1] === '*';
  // 如果左侧形成 ** 且不是 *** 的一部分，则不是斜体
  if (leftIsBoldStart && (start < 3 || sourceText[start - 3] !== '*')) return false;

  // 右侧：检查 * 是否为独立斜体标记（非纯加粗 ** 的组成部分）
  const rightIsBoldEnd =
    end + 2 <= sourceText.length &&
    sourceText[end] === '*' &&
    sourceText[end + 1] === '*';
  if (rightIsBoldEnd && (end + 3 > sourceText.length || sourceText[end + 2] !== '*')) return false;

  return true;
}

/** 在源文本精确偏移量处插入 * 斜体标记 */
export function italicAtPosition(sourceText: string, start: number, end: number): string {
  if (start < 0 || end > sourceText.length || start >= end) return sourceText;

  return (
    sourceText.substring(0, start) +
    '*' +
    sourceText.substring(start, end) +
    '*' +
    sourceText.substring(end)
  );
}

/**
 * 在源文本精确偏移量处移除 * 斜体标记。
 */
export function unitalicAtPosition(sourceText: string, start: number, end: number): string {
  if (start < 1 || end + 1 > sourceText.length) return sourceText;

  return (
    sourceText.substring(0, start - 1) +
    sourceText.substring(start, end) +
    sourceText.substring(end + 1)
  );
}

/** 基于偏移量切换斜体状态 */
export function toggleItalicAtPosition(
  sourceText: string,
  start: number,
  end: number
): string {
  if (isRangeItalic(sourceText, start, end)) {
    return unitalicAtPosition(sourceText, start, end);
  }
  return italicAtPosition(sourceText, start, end);
}

// ====== 清除格式 ======

/**
 * 清除选中区域内所有 markdown 格式标记（** 和 *），
 * 并自动清理边界处因清除内层标记而产生的孤立标记。
 */
export function clearFormatAtPosition(
  sourceText: string,
  start: number,
  end: number
): string {
  // Step 1: 将选中区域内的所有 * 字符剥离
  let prefix = sourceText.substring(0, start);
  let middle = sourceText.substring(start, end).replace(/\*/g, '');
  let suffix = sourceText.substring(end);

  // Step 2: 按优先级清理边界处的孤立标记（先排查三层 ***，再两层 **，最后单层 *）
  // *** 清理
  while (prefix.endsWith('***')) {
    prefix = prefix.slice(0, -3);
  }
  while (suffix.startsWith('***')) {
    suffix = suffix.slice(3);
  }

  // ** 清理
  while (prefix.endsWith('**')) {
    prefix = prefix.slice(0, -2);
  }
  while (suffix.startsWith('**')) {
    suffix = suffix.slice(2);
  }

  // 单独 * 清理（但不误删 ** 里的第二个星号）
  if (prefix.endsWith('*') && !prefix.endsWith('**')) {
    prefix = prefix.slice(0, -1);
  }
  if (suffix.startsWith('*') && !suffix.startsWith('**')) {
    suffix = suffix.slice(1);
  }

  return prefix + middle + suffix;
}
