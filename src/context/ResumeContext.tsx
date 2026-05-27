import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { ResumeData, ResumeAction, AppUIState, AppUIAction, DEFAULT_THEME } from '../types/resume';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'resume-editor-data';

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: '抹茶布丁',
    phone: '138-0000-0000',
    email: 'example@email.com',
    photoUrl: '/default_avatar.jpg',
    tags: ['应届毕业生', '移动端开发', '深圳'],
  },
  education: [
    {
      id: uuidv4(),
      school: '清华大学',
      major: '计算机科学与技术',
      degree: '本科',
      startDate: '2020.09',
      endDate: '2024.06',
    },
    {
      id: uuidv4(),
      school: '北京大学',
      major: '计算机科学与技术',
      degree: '硕士研究生',
      startDate: '2024.09',
      endDate: '2027.06',
    }
  ],
  skills: [
    '**移动端开发技术**：熟练掌握 Android 原生开发（Java/Kotlin）/iOS 原生开发（Swift），精通 React Native/Flutter 跨平台开发框架，具备独立完成移动端应用从需求到上线的全流程能力',
    '**前端与适配能力**：精通 HTML5/CSS3/JavaScript，熟练实现移动端响应式布局与多机型适配，解决 iOS/Android 不同版本兼容性问题',
    '**后端与接口能力**：熟悉 Spring Boot 后端框架，能独立编写 RESTful API，熟练使用 MySQL 数据库进行数据交互与优化',
    '**工具与工程化**：熟练使用 Git 进行版本控制，掌握 Android Studio/Xcode 开发工具，了解 Jenkins 自动化打包与发布流程'
  ],
  workExperience: [
    {
      id: uuidv4(),
      company: 'XX科技有限公司',
      position: '前端开发实习生',
      location: '深圳',
      startDate: '2023.06',
      endDate: '2023.09',
      highlights: [
        '参与公司核心产品的前端模块开发，基于 React + TypeScript 技术栈，独立完成 XX 模块的需求分析、组件设计与功能开发，保障业务稳定上线。',
        '针对项目加载性能问题进行优化，通过路由懒加载、组件按需引入、图片压缩与 CDN 分发等手段，将页面首屏渲染时间降低 30%，显著提升用户体验。',
        '参与前端项目代码重构，优化组件复用逻辑，封装通用业务组件库，减少重复代码约 20%，提升团队开发效率。',
        '配合测试与后端同学完成接口联调、Bug 修复与版本迭代，保障项目按计划交付。'
      ],
    },
    {
      id: uuidv4(),
      company: 'XX科技有限公司',
      position: '前端开发实习生',
      location: '上海',
      startDate: '2024.06',
      endDate: '2024.09',
      highlights: [
        '参与电商后台管理系统的开发与维护，基于 React + TypeScript 技术栈，独立完成订单管理、商品列表等模块的开发，实现数据可视化展示与复杂业务逻辑。',
        '与产品、后端同学紧密协作，参与需求评审、技术方案讨论，提前识别并解决了多个前后端字段不一致、边界场景缺失等潜在问题，降低开发返工率。',
        '负责部分用户反馈问题的修复，针对列表卡顿、表单交互体验差等问题进行优化，提升页面响应速度约 20%，用户好评率明显提升。',
        '整理开发过程中的技术难点与踩坑记录，输出 2 篇团队内部技术分享文档，帮助新同学快速上手项目。'
      ],
    }
  ],
  projects: [
    {
      id: uuidv4(),
      name: '在线简历编辑器',
      role: '前端开发',
      startDate: '2023.01',
      endDate: '2023.03',
      link: '',
      highlights: [
        '**技术栈**：React + TypeScript + Tailwind CSS + snapdom + jsPDF',
        '独立完成项目整体架构设计与开发，实现简历在线编辑、实时预览、模板切换与 PDF 导出等核心功能。',
        '基于组件化思想拆分可复用的表单组件、预览组件，通过 Context API 实现全局状态管理，支持用户自定义简历模块内容与样式。',
        '优化 PDF 导出功能，解决跨域图片导出、样式错乱等问题，实现高保真简历导出，支持多种模板样式一键切换。',
        '实现响应式布局，适配 PC 端与移动端多端预览场景，提升不同设备下的用户体验。'
      ],
    },
    {
      id: uuidv4(),
      name: '电商商品管理后台系统',
      role: '前端开发',
      startDate: '2024.09',
      endDate: '2024.12',
      link: '',
      highlights: [
        '**技术栈**：Vue3 + TypeScript + Element Plus + Vite',
        '负责商品管理模块的前端开发，实现商品列表查询、新增、编辑、上下架等功能，支持分页、筛选、批量操作。',
        '封装通用表格、表单组件，减少重复代码开发，提升团队开发效率，模块复用率达 80%。',
        '实现用户权限控制，基于 RBAC 模型 实现路由与按钮级别的权限控制，保障系统数据安全。',
        '优化列表渲染性能，通过虚拟列表实现万级数据的流畅渲染，避免页面卡顿问题。'
      ],
    },
  ],
};

function resumeReducer(state: ResumeData, action: ResumeAction): ResumeData {
  switch (action.type) {
    case 'SET_PERSONAL_INFO':
      return { ...state, personalInfo: { ...state.personalInfo, ...action.payload } };

    case 'ADD_EDUCATION':
      return { ...state, education: [...state.education, action.payload] };

    case 'UPDATE_EDUCATION':
      return {
        ...state,
        education: state.education.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case 'DELETE_EDUCATION':
      return {
        ...state,
        education: state.education.filter((e) => e.id !== action.payload),
      };

    case 'ADD_SKILL':
      return { ...state, skills: [...state.skills, action.payload] };

    case 'UPDATE_SKILL':
      return {
        ...state,
        skills: state.skills.map((s, i) =>
          i === action.payload.index ? action.payload.item : s
        ),
      };

    case 'DELETE_SKILL':
      return {
        ...state,
        skills: state.skills.filter((_, i) => i !== action.payload),
      };

    case 'ADD_WORK_EXPERIENCE':
      return { ...state, workExperience: [...state.workExperience, action.payload] };

    case 'UPDATE_WORK_EXPERIENCE':
      return {
        ...state,
        workExperience: state.workExperience.map((w) =>
          w.id === action.payload.id ? action.payload : w
        ),
      };

    case 'DELETE_WORK_EXPERIENCE':
      return {
        ...state,
        workExperience: state.workExperience.filter((w) => w.id !== action.payload),
      };

    case 'ADD_WORK_HIGHLIGHT':
      return {
        ...state,
        workExperience: state.workExperience.map((w) =>
          w.id === action.payload.workId
            ? { ...w, highlights: [...w.highlights, action.payload.highlight] }
            : w
        ),
      };

    case 'UPDATE_WORK_HIGHLIGHT':
      return {
        ...state,
        workExperience: state.workExperience.map((w) =>
          w.id === action.payload.workId
            ? {
                ...w,
                highlights: w.highlights.map((h, i) =>
                  i === action.payload.index ? action.payload.highlight : h
                ),
              }
            : w
        ),
      };

    case 'DELETE_WORK_HIGHLIGHT':
      return {
        ...state,
        workExperience: state.workExperience.map((w) =>
          w.id === action.payload.workId
            ? { ...w, highlights: w.highlights.filter((_, i) => i !== action.payload.index) }
            : w
        ),
      };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== action.payload),
      };

    case 'ADD_PROJECT_HIGHLIGHT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? { ...p, highlights: [...p.highlights, action.payload.highlight] }
            : p
        ),
      };

    case 'UPDATE_PROJECT_HIGHLIGHT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? {
                ...p,
                highlights: p.highlights.map((h, i) =>
                  i === action.payload.index ? action.payload.highlight : h
                ),
              }
            : p
        ),
      };

    case 'DELETE_PROJECT_HIGHLIGHT':
      return {
        ...state,
        projects: state.projects.map((p) =>
          p.id === action.payload.projectId
            ? { ...p, highlights: p.highlights.filter((_, i) => i !== action.payload.index) }
            : p
        ),
      };

    case 'LOAD_DATA':
      return action.payload;

    case 'RESET_DATA':
      return defaultResumeData;

    case 'RESTORE_STATE':
      return action.payload;

    default:
      return state;
  }
}

interface ResumeContextType {
  data: ResumeData;
  dispatch: React.Dispatch<ResumeAction>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// ====== 全局历史栈 Context ======

interface HistoryContextType {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const MAX_HISTORY = 50;

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [data, rawDispatch] = useReducer(resumeReducer, defaultResumeData, (initial) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load resume data from localStorage:', e);
    }
    return initial;
  });

  // ====== 全局历史栈 ======
  const historyRef = useRef<ResumeData[]>([deepClone(data)]);
  const idxRef = useRef(0);
  const skipRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const updateButtons = useCallback(() => {
    setCanUndo(idxRef.current > 0);
    setCanRedo(idxRef.current < historyRef.current.length - 1);
  }, []);

  // 监听 data 变化，自动将每次正常操作的结果推入历史栈
  const prevRef = useRef(data);
  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      prevRef.current = data;
      updateButtons();
      return;
    }
    if (data === prevRef.current) return;

    // 正常操作 → 推入历史栈
    historyRef.current = [
      ...historyRef.current.slice(0, idxRef.current + 1),
      deepClone(data),
    ];
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    } else {
      idxRef.current++;
    }
    prevRef.current = data;
    updateButtons();
  }, [data, updateButtons]);

  // 包装 dispatch：RESTORE_STATE 时标记跳过记录
  const dispatch = useCallback(
    (action: ResumeAction) => {
      if (action.type === 'RESTORE_STATE') {
        skipRef.current = true;
      }
      rawDispatch(action);
    },
    [rawDispatch]
  );

  const undo = useCallback(() => {
    if (idxRef.current <= 0) return;
    idxRef.current--;
    dispatch({
      type: 'RESTORE_STATE',
      payload: deepClone(historyRef.current[idxRef.current]),
    });
  }, [dispatch]);

  const redo = useCallback(() => {
    if (idxRef.current >= historyRef.current.length - 1) return;
    idxRef.current++;
    dispatch({
      type: 'RESTORE_STATE',
      payload: deepClone(historyRef.current[idxRef.current]),
    });
  }, [dispatch]);

  // localStorage 持久化
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to save resume data to localStorage:', e);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [data]);

  return (
    <ResumeContext.Provider value={{ data, dispatch }}>
      <HistoryContext.Provider value={{ undo, redo, canUndo, canRedo }}>
        {children}
      </HistoryContext.Provider>
    </ResumeContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within a ResumeProvider');
  }
  return context;
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}

// ---- App UI State ----

function appUIReducer(state: AppUIState, action: AppUIAction): AppUIState {
  switch (action.type) {
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.3, Math.min(1.5, action.payload)) };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'SET_SETTINGS_OPEN':
      return { ...state, settingsOpen: action.payload };
    case 'SET_THEME':
      return { ...state, theme: { ...state.theme, ...action.payload } };
    case 'SET_WATERMARK':
      return {
        ...state,
        theme: {
          ...state.theme,
          watermark: { ...state.theme.watermark, ...action.payload },
        },
      };
    case 'RESET_STYLE':
      return { ...state, theme: DEFAULT_THEME };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'TRIGGER_SAVE_ANIMATION':
      return { ...state, saveStatus: 'saved', saveTrigger: state.saveTrigger + 1 };
    case 'SET_DRAWER_OPEN':
      return { ...state, drawerOpen: action.payload };
    default:
      return state;
  }
}

const defaultAppUI: AppUIState = {
  activeSection: 'personal',
  zoom: 1,
  settingsOpen: true,
  theme: DEFAULT_THEME,
  saveStatus: 'saved',
  saveTrigger: 0,
  drawerOpen: false,
};

interface AppUIContextType {
  ui: AppUIState;
  uiDispatch: React.Dispatch<AppUIAction>;
}

const AppUIContext = createContext<AppUIContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ui, uiDispatch] = useReducer(appUIReducer, defaultAppUI);

  return (
    <AppUIContext.Provider value={{ ui, uiDispatch }}>
      {children}
    </AppUIContext.Provider>
  );
}

export function useAppUI() {
  const context = useContext(AppUIContext);
  if (!context) {
    throw new Error('useAppUI must be used within an AppProvider');
  }
  return context;
}
