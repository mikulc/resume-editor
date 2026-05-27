export interface PersonalInfo {
  fullName: string;
  phone: string;
  email: string;
  photoUrl: string;
  tags: string[];
}

export interface EducationEntry {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  courses?: string;
}

export interface WorkEntry {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  highlights: string[];
}

export interface ProjectEntry {
  id: string;
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  link: string;
  highlights: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: EducationEntry[];
  skills: string[];
  workExperience: WorkEntry[];
  projects: ProjectEntry[];
}

export type ResumeAction =
  | { type: 'SET_PERSONAL_INFO'; payload: Partial<PersonalInfo> }
  | { type: 'ADD_EDUCATION'; payload: EducationEntry }
  | { type: 'UPDATE_EDUCATION'; payload: EducationEntry }
  | { type: 'DELETE_EDUCATION'; payload: string }
  | { type: 'ADD_SKILL'; payload: string }
  | { type: 'UPDATE_SKILL'; payload: { index: number; item: string } }
  | { type: 'DELETE_SKILL'; payload: number }
  | { type: 'ADD_WORK_EXPERIENCE'; payload: WorkEntry }
  | { type: 'UPDATE_WORK_EXPERIENCE'; payload: WorkEntry }
  | { type: 'DELETE_WORK_EXPERIENCE'; payload: string }
  | { type: 'ADD_WORK_HIGHLIGHT'; payload: { workId: string; highlight: string } }
  | { type: 'UPDATE_WORK_HIGHLIGHT'; payload: { workId: string; index: number; highlight: string } }
  | { type: 'DELETE_WORK_HIGHLIGHT'; payload: { workId: string; index: number } }
  | { type: 'ADD_PROJECT'; payload: ProjectEntry }
  | { type: 'UPDATE_PROJECT'; payload: ProjectEntry }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'ADD_PROJECT_HIGHLIGHT'; payload: { projectId: string; highlight: string } }
  | { type: 'UPDATE_PROJECT_HIGHLIGHT'; payload: { projectId: string; index: number; highlight: string } }
  | { type: 'DELETE_PROJECT_HIGHLIGHT'; payload: { projectId: string; index: number } }
  | { type: 'LOAD_DATA'; payload: ResumeData }
  | { type: 'RESET_DATA' }
  | { type: 'RESTORE_STATE'; payload: ResumeData };

export type SectionKey = 'personal' | 'education' | 'skills' | 'work' | 'projects';

export type SaveStatusType = 'saved' | 'unsaved' | 'saving' | 'error';

export interface WatermarkSettings {
  enabled: boolean;
  content: string;
  opacity: number;      // 0.03 ~ 0.3
  fontSize: number;     // 1 ~ 48 px
  rotation: number;     // -90 ~ 0 度
  color: string;        // hex color
  density: 'low' | 'medium' | 'high';  // 稀疏 | 适中 | 密集
}

export const DEFAULT_WATERMARK: WatermarkSettings = {
  enabled: true,
  content: '抹茶布丁',
  opacity: 0.08,
  fontSize: 26,
  rotation: -30,
  color: '#6B7280',
  density: 'medium',
};

export interface ThemeSettings {
  colorTheme: 'blue' | 'gray' | 'black';
  pageMargin: number; // mm
  lineSpacing: number;
  exportScale: number; // PDF 导出清晰度 (1-5)
  watermark: WatermarkSettings;
}

export const DEFAULT_THEME: ThemeSettings = {
  colorTheme: 'blue',
  pageMargin: 15,
  lineSpacing: 1.6,
  exportScale: 2.5,
  watermark: DEFAULT_WATERMARK,
};

export interface AppUIState {
  activeSection: SectionKey | null;
  zoom: number;
  settingsOpen: boolean;
  theme: ThemeSettings;
  saveStatus: SaveStatusType;
  saveTrigger: number; // incremented on save complete, drives breathing animation
  drawerOpen: boolean; // 抽屉是否打开（用于快捷键隔离）
}

export type AppUIAction =
  | { type: 'SET_ACTIVE_SECTION'; payload: SectionKey | null }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: Partial<ThemeSettings> }
  | { type: 'SET_WATERMARK'; payload: Partial<WatermarkSettings> }
  | { type: 'RESET_STYLE' }
  | { type: 'SET_SAVE_STATUS'; payload: SaveStatusType }
  | { type: 'TRIGGER_SAVE_ANIMATION' }
  | { type: 'SET_DRAWER_OPEN'; payload: boolean };
