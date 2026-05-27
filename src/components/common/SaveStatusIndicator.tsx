import React, { useState, useEffect, useRef } from 'react';
import type { SaveStatusType } from '../../types/resume';
import { triggerRetrySave } from './SaveSync';

interface SaveStatusIndicatorProps {
  saveStatus: SaveStatusType;
  saveTrigger: number;
}

// ================================================================
// 各状态配置：圆点类名 + 文字 + 文字颜色
// ================================================================
interface StatusConfig {
  dotClass: string;
  text: string;
  textColor: string;
}

const STATUS_MAP: Record<SaveStatusType, StatusConfig> = {
  saved: {
    dotClass: 'bg-green-500 breathing-dot-saved',
    text: '已保存',
    textColor: 'text-gray-500',
  },
  unsaved: {
    dotClass: 'bg-yellow-500',
    text: '未保存',
    textColor: 'text-yellow-600',
  },
  saving: {
    dotClass: 'bg-blue-500 breathing-dot-saving',
    text: '保存中',
    textColor: 'text-blue-500',
  },
  error: {
    dotClass: 'bg-red-500 breathing-dot-error',
    text: '保存失败，点击重试',
    textColor: 'text-red-500',
  },
};

// ================================================================
// SaveStatusIndicator 组件
//
// 纯 CSS 驱动的多状态呼吸灯：
//   - saved  → 绿色持续呼吸（4s 自然节奏）
//   - saving  → 蓝色快速呼吸（1.2s 脉冲）
//   - error   → 红色急促呼吸（1s 警告）
//   - unsaved → 静态黄色圆点（无动画）
//
// 保存完成时叠加短暂"确认脉冲"（0.6s）增强反馈。
// ================================================================
export function SaveStatusIndicator({ saveStatus, saveTrigger }: SaveStatusIndicatorProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const prevTriggerRef = useRef(saveTrigger);

  // 保存完成瞬间 → 触发确认脉冲（短暂叠加在持续呼吸之上）
  useEffect(() => {
    if (saveStatus === 'saved' && saveTrigger > 0 && saveTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = saveTrigger;
      setShowConfirm(true);
      const timer = setTimeout(() => setShowConfirm(false), 600);
      return () => clearTimeout(timer);
    }
    prevTriggerRef.current = saveTrigger;
  }, [saveTrigger, saveStatus]);

  const config = STATUS_MAP[saveStatus] ?? STATUS_MAP.saved;
  const isError = saveStatus === 'error';

  // 组合圆点类名：基础呼吸动画 + 确认脉冲叠加
  const dotClass = [config.dotClass, showConfirm && 'breathing-dot-confirm']
    .filter(Boolean)
    .join(' ');

  return (
    <button
      onClick={isError ? triggerRetrySave : undefined}
      disabled={!isError}
      title={isError ? '点击重试保存' : config.text}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
        isError ? 'hover:bg-red-50 cursor-pointer' : 'cursor-default'
      }`}
    >
      {/* 呼吸灯圆点 — 纯 CSS 动画驱动，零 JS 开销 */}
      <span
        className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`}
      />
      {/* 状态文字 */}
      <span className={`text-xs font-medium whitespace-nowrap ${config.textColor}`}>
        {config.text}
      </span>
    </button>
  );
}
