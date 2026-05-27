import React, { useState, useCallback } from 'react';
import { useResume, useAppUI } from '../../context/ResumeContext';
import { v4 as uuidv4 } from 'uuid';
import { EducationEntry, ProjectEntry, WorkEntry } from '../../types/resume';
import { ThreeDotMenu } from './ThreeDotMenu';
import { HighlightDrawer } from './HighlightDrawer';

// 根据 colorTheme 获取编辑器控件的主题样式
function useAccentStyle() {
  const { ui } = useAppUI();
  const ct = ui.theme.colorTheme;
  const styles = {
    blue: {
      focusBorder: 'focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30',
      focusOutline: 'focus:outline-none',
      tagInput: 'bg-blue-50 border-blue-200 text-blue-600 focus:border-blue-400',
      numberColor: 'text-blue-500',
      addHover: 'hover:border-blue-400 hover:text-blue-500',
    },
    gray: {
      focusBorder: 'focus:border-gray-400 focus:ring-1 focus:ring-gray-400/30',
      focusOutline: 'focus:outline-none',
      tagInput: 'bg-gray-50 border-gray-300 text-gray-600 focus:border-gray-400',
      numberColor: 'text-gray-500',
      addHover: 'hover:border-gray-400 hover:text-gray-600',
    },
    black: {
      focusBorder: 'focus:border-gray-500 focus:ring-1 focus:ring-gray-500/30',
      focusOutline: 'focus:outline-none',
      tagInput: 'bg-gray-100 border-gray-300 text-gray-700 focus:border-gray-500',
      numberColor: 'text-gray-600',
      addHover: 'hover:border-gray-500 hover:text-gray-700',
    },
  } as const;
  return styles[ct];
}

function EditableHighlightList({
  highlights,
  onAdd,
  onUpdate,
  onDelete,
  onEdit,
  placeholder = '描述要点...',
  label = '工作要点',
  addLabel = '添加要点',
}: {
  highlights: string[];
  onAdd: (text: string) => void;
  onUpdate: (index: number, text: string) => void;
  onDelete: (index: number) => void;
  onEdit?: (index: number) => void;
  placeholder?: string;
  label?: string;
  addLabel?: string;
}) {
  const accent = useAccentStyle();

  return (
    <div>
      <label className="text-xs text-gray-500 font-medium mb-2 block">{label}</label>
      <div className="space-y-2">
        {highlights.map((h, i) => (
          <div key={i} className="flex gap-1.5 items-start group">
            <span className={`${accent.numberColor} text-xs mt-2.5 min-w-[18px]`}>{i + 1}.</span>
            <input
              value={h}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={placeholder}
              className={`flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-xs placeholder:text-gray-400 ${accent.focusBorder} transition-colors`}
            />
            <ThreeDotMenu
              onEdit={onEdit ? () => onEdit(i) : undefined}
              onDelete={() => onDelete(i)}
            />
          </div>
        ))}
        <button
          onClick={() => onAdd('')}
          className={`w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 ${accent.addHover} transition-all text-xs`}
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {addLabel}
        </button>
      </div>
    </div>
  );
}

function StyledInput({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  const accent = useAccentStyle();

  return (
    <div className={className}>
      <label className="text-xs text-gray-500 font-medium mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-800 text-xs placeholder:text-gray-400 ${accent.focusBorder} transition-colors`}
      />
    </div>
  );
}

// Personal Info Editor
export function PersonalInfoEditor() {
  const { data, dispatch } = useResume();
  const { personalInfo } = data;
  const accent = useAccentStyle();

  const updateField = (field: string, value: string) => {
    dispatch({ type: 'SET_PERSONAL_INFO', payload: { [field]: value } });
  };

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...personalInfo.tags];
    if (value) {
      newTags[index] = value;
    } else {
      newTags.splice(index, 1);
    }
    dispatch({ type: 'SET_PERSONAL_INFO', payload: { tags: newTags } });
  };

  const addTag = () => {
    dispatch({
      type: 'SET_PERSONAL_INFO',
      payload: { tags: [...personalInfo.tags, ''] },
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        dispatch({
          type: 'SET_PERSONAL_INFO',
          payload: { photoUrl: ev.target?.result as string },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      <StyledInput label="姓名" value={personalInfo.fullName} onChange={(v) => updateField('fullName', v)} />
      <div className="grid grid-cols-2 gap-3">
        <StyledInput label="电话" value={personalInfo.phone} onChange={(v) => updateField('phone', v)} />
        <StyledInput label="邮箱" value={personalInfo.email} onChange={(v) => updateField('email', v)} />
      </div>
      <div>
        <label className="text-xs text-gray-500 font-medium mb-1.5 block">求职标签</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {personalInfo.tags.map((tag, i) => (
            <input
              key={i}
              value={tag}
              onChange={(e) => handleTagChange(i, e.target.value)}
              placeholder="标签"
              className={`w-24 ${accent.tagInput} rounded-full px-3 py-1 text-xs focus:outline-none text-center transition-colors`}
            />
          ))}
          <button
            onClick={addTag}
            className={`w-8 h-7 flex items-center justify-center rounded-full border border-dashed border-gray-300 text-gray-400 ${accent.addHover} transition-all`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-500 font-medium mb-1.5 block">证件照</label>
        <div className="flex items-center gap-3">
          {personalInfo.photoUrl ? (
            <img
              src={personalInfo.photoUrl}
              alt="证件照"
              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
              无照片
            </div>
          )}
          <label className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs rounded-lg cursor-pointer transition-colors border border-gray-200">
            上传照片
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}

// Education Editor
export function EducationEditor() {
  const { data, dispatch } = useResume();
  const accent = useAccentStyle();

  const addEducation = () => {
    const entry: EducationEntry = {
      id: uuidv4(),
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: '',
    };
    dispatch({ type: 'ADD_EDUCATION', payload: entry });
  };

  const updateEducation = (entry: EducationEntry) => {
    dispatch({ type: 'UPDATE_EDUCATION', payload: entry });
  };

  const deleteEducation = (id: string) => {
    dispatch({ type: 'DELETE_EDUCATION', payload: id });
  };

  return (
    <div className="space-y-3">
      {data.education.map((edu, index) => (
        <div key={edu.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400"># {index + 1}</span>
            <button
              onClick={() => deleteEducation(edu.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <StyledInput label="学校名称" value={edu.school} onChange={(v) => updateEducation({ ...edu, school: v })} />
          <div className="grid grid-cols-2 gap-3">
            <StyledInput label="专业" value={edu.major} onChange={(v) => updateEducation({ ...edu, major: v })} />
            <StyledInput label="学历" value={edu.degree} onChange={(v) => updateEducation({ ...edu, degree: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StyledInput label="开始时间" value={edu.startDate} onChange={(v) => updateEducation({ ...edu, startDate: v })} placeholder="2020.09" />
            <StyledInput label="结束时间" value={edu.endDate} onChange={(v) => updateEducation({ ...edu, endDate: v })} placeholder="2024.06" />
          </div>

        </div>
      ))}
      <button
        onClick={addEducation}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 ${accent.addHover} transition-all text-xs`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加教育经历
      </button>
    </div>
  );
}

// Skills Editor
export function SkillsEditor() {
  const { data, dispatch } = useResume();

  // 抽屉状态
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    highlightIndex: number;
    originalText: string;
  }>({ isOpen: false, highlightIndex: -1, originalText: '' });

  // 打开抽屉编辑技能项
  const handleEditSkillItem = useCallback(
    (index: number) => {
      setDrawerState({
        isOpen: true,
        highlightIndex: index,
        originalText: data.skills[index] || '',
      });
    },
    [data.skills],
  );

  // 抽屉中文本变更 → 实时同步
  const handleDrawerTextChange = useCallback(
    (text: string) => {
      dispatch({
        type: 'UPDATE_SKILL',
        payload: { index: drawerState.highlightIndex, item: text },
      });
    },
    [dispatch, drawerState.highlightIndex],
  );

  // 保存 → 关闭抽屉
  const handleDrawerSave = useCallback(() => {
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 取消 → 恢复原始文本并关闭
  const handleDrawerCancel = useCallback(() => {
    dispatch({
      type: 'UPDATE_SKILL',
      payload: { index: drawerState.highlightIndex, item: drawerState.originalText },
    });
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  }, [dispatch, drawerState.highlightIndex, drawerState.originalText]);

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <EditableHighlightList
          highlights={data.skills}
          label="技能项"
          addLabel="添加技能"
          placeholder="描述技能要点..."
          onAdd={(text) => dispatch({ type: 'ADD_SKILL', payload: text })}
          onUpdate={(index, text) =>
            dispatch({ type: 'UPDATE_SKILL', payload: { index, item: text } })
          }
          onDelete={(index) =>
            dispatch({ type: 'DELETE_SKILL', payload: index })
          }
          onEdit={(index) => handleEditSkillItem(index)}
        />
      </div>

      {/* 技能项编辑抽屉 */}
      {drawerState.isOpen && (
        <HighlightDrawer
          isOpen={drawerState.isOpen}
          title="编辑技能项"
          text={data.skills[drawerState.highlightIndex] || ''}
          highlightIndex={drawerState.highlightIndex + 1}
          totalCount={data.skills.length}
          onTextChange={handleDrawerTextChange}
          onSave={handleDrawerSave}
          onCancel={handleDrawerCancel}
        />
      )}
    </div>
  );
}

// Work Experience Editor
export function WorkExperienceEditor() {
  const { data, dispatch } = useResume();
  const accent = useAccentStyle();

  // 抽屉状态
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    workId: string;
    highlightIndex: number;
    originalText: string;
  }>({ isOpen: false, workId: '', highlightIndex: -1, originalText: '' });

  const addWork = () => {
    const entry: WorkEntry = {
      id: uuidv4(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      highlights: [],
    };
    dispatch({ type: 'ADD_WORK_EXPERIENCE', payload: entry });
  };

  // 打开抽屉编辑要点
  const handleEditHighlight = useCallback(
    (workId: string, index: number) => {
      const work = data.workExperience.find((w) => w.id === workId);
      if (!work) return;
      setDrawerState({
        isOpen: true,
        workId,
        highlightIndex: index,
        originalText: work.highlights[index] || '',
      });
    },
    [data.workExperience],
  );

  // 抽屉中文本变更 → 实时同步
  const handleDrawerTextChange = useCallback(
    (text: string) => {
      dispatch({
        type: 'UPDATE_WORK_HIGHLIGHT',
        payload: {
          workId: drawerState.workId,
          index: drawerState.highlightIndex,
          highlight: text,
        },
      });
    },
    [dispatch, drawerState.workId, drawerState.highlightIndex],
  );

  // 保存 → 关闭抽屉
  const handleDrawerSave = useCallback(() => {
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 取消 → 恢复原始文本并关闭
  const handleDrawerCancel = useCallback(() => {
    dispatch({
      type: 'UPDATE_WORK_HIGHLIGHT',
      payload: {
        workId: drawerState.workId,
        index: drawerState.highlightIndex,
        highlight: drawerState.originalText,
      },
    });
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  }, [dispatch, drawerState.workId, drawerState.highlightIndex, drawerState.originalText]);

  return (
    <div className="space-y-3">
      {data.workExperience.map((work, i) => (
        <div key={work.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400"># {i + 1}</span>
            <button
              onClick={() => dispatch({ type: 'DELETE_WORK_EXPERIENCE', payload: work.id })}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <StyledInput label="公司名称" value={work.company} onChange={(v) => dispatch({ type: 'UPDATE_WORK_EXPERIENCE', payload: { ...work, company: v } })} />
          <div className="grid grid-cols-2 gap-3">
            <StyledInput label="岗位" value={work.position} onChange={(v) => dispatch({ type: 'UPDATE_WORK_EXPERIENCE', payload: { ...work, position: v } })} />
            <StyledInput label="地点" value={work.location} onChange={(v) => dispatch({ type: 'UPDATE_WORK_EXPERIENCE', payload: { ...work, location: v } })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StyledInput label="开始时间" value={work.startDate} onChange={(v) => dispatch({ type: 'UPDATE_WORK_EXPERIENCE', payload: { ...work, startDate: v } })} />
            <StyledInput label="结束时间" value={work.endDate} onChange={(v) => dispatch({ type: 'UPDATE_WORK_EXPERIENCE', payload: { ...work, endDate: v } })} />
          </div>
          <EditableHighlightList
            highlights={work.highlights}
            onAdd={(text) => dispatch({ type: 'ADD_WORK_HIGHLIGHT', payload: { workId: work.id, highlight: text } })}
            onUpdate={(index, text) => dispatch({ type: 'UPDATE_WORK_HIGHLIGHT', payload: { workId: work.id, index, highlight: text } })}
            onDelete={(index) => dispatch({ type: 'DELETE_WORK_HIGHLIGHT', payload: { workId: work.id, index } })}
            onEdit={(index) => handleEditHighlight(work.id, index)}
            placeholder="使用 STAR 法则描述工作成果..."
          />
        </div>
      ))}
      <button
        onClick={addWork}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 ${accent.addHover} transition-all text-xs`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加工作经历
      </button>

      {/* 要点编辑抽屉 */}
      {drawerState.isOpen && (() => {
        const work = data.workExperience.find((w) => w.id === drawerState.workId);
        return (
          <HighlightDrawer
            isOpen={drawerState.isOpen}
            title="编辑工作要点"
            text={work?.highlights[drawerState.highlightIndex] || ''}
            highlightIndex={drawerState.highlightIndex + 1}
            totalCount={work?.highlights.length || 0}
            onTextChange={handleDrawerTextChange}
            onSave={handleDrawerSave}
            onCancel={handleDrawerCancel}
          />
        );
      })()}
    </div>
  );
}

// Project Editor
export function ProjectEditor() {
  const { data, dispatch } = useResume();
  const accent = useAccentStyle();

  // 抽屉状态
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    projectId: string;
    highlightIndex: number;
    originalText: string;
  }>({ isOpen: false, projectId: '', highlightIndex: -1, originalText: '' });

  const addProject = () => {
    const entry: ProjectEntry = {
      id: uuidv4(),
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      link: '',
      highlights: [],
    };
    dispatch({ type: 'ADD_PROJECT', payload: entry });
  };

  // 打开抽屉编辑要点
  const handleEditHighlight = useCallback(
    (projectId: string, index: number) => {
      const project = data.projects.find((p) => p.id === projectId);
      if (!project) return;
      setDrawerState({
        isOpen: true,
        projectId,
        highlightIndex: index,
        originalText: project.highlights[index] || '',
      });
    },
    [data.projects],
  );

  // 抽屉中文本变更 → 实时同步
  const handleDrawerTextChange = useCallback(
    (text: string) => {
      dispatch({
        type: 'UPDATE_PROJECT_HIGHLIGHT',
        payload: {
          projectId: drawerState.projectId,
          index: drawerState.highlightIndex,
          highlight: text,
        },
      });
    },
    [dispatch, drawerState.projectId, drawerState.highlightIndex],
  );

  // 保存 → 关闭抽屉
  const handleDrawerSave = useCallback(() => {
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // 取消 → 恢复原始文本并关闭
  const handleDrawerCancel = useCallback(() => {
    dispatch({
      type: 'UPDATE_PROJECT_HIGHLIGHT',
      payload: {
        projectId: drawerState.projectId,
        index: drawerState.highlightIndex,
        highlight: drawerState.originalText,
      },
    });
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  }, [dispatch, drawerState.projectId, drawerState.highlightIndex, drawerState.originalText]);

  return (
    <div className="space-y-3">
      {data.projects.map((proj, i) => (
        <div key={proj.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400"># {i + 1}</span>
            <button
              onClick={() => dispatch({ type: 'DELETE_PROJECT', payload: proj.id })}
              className="text-gray-400 hover:text-red-500 transition-colors p-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          <StyledInput label="项目名称" value={proj.name} onChange={(v) => dispatch({ type: 'UPDATE_PROJECT', payload: { ...proj, name: v } })} />
          <StyledInput label="开发角色" value={proj.role} onChange={(v) => dispatch({ type: 'UPDATE_PROJECT', payload: { ...proj, role: v } })} />
          <div className="grid grid-cols-2 gap-3">
            <StyledInput label="开始时间" value={proj.startDate} onChange={(v) => dispatch({ type: 'UPDATE_PROJECT', payload: { ...proj, startDate: v } })} />
            <StyledInput label="结束时间" value={proj.endDate} onChange={(v) => dispatch({ type: 'UPDATE_PROJECT', payload: { ...proj, endDate: v } })} />
          </div>
          <StyledInput label="项目链接（选填）" value={proj.link} onChange={(v) => dispatch({ type: 'UPDATE_PROJECT', payload: { ...proj, link: v } })} />
          <EditableHighlightList
            highlights={proj.highlights}
            onAdd={(text) => dispatch({ type: 'ADD_PROJECT_HIGHLIGHT', payload: { projectId: proj.id, highlight: text } })}
            onUpdate={(index, text) => dispatch({ type: 'UPDATE_PROJECT_HIGHLIGHT', payload: { projectId: proj.id, index, highlight: text } })}
            onDelete={(index) => dispatch({ type: 'DELETE_PROJECT_HIGHLIGHT', payload: { projectId: proj.id, index } })}
            onEdit={(index) => handleEditHighlight(proj.id, index)}
            placeholder="描述项目背景、技术栈、你的职责和成果..."
          />
        </div>
      ))}
      <button
        onClick={addProject}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 ${accent.addHover} transition-all text-xs`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        添加项目经历
      </button>

      {/* 要点编辑抽屉 */}
      {drawerState.isOpen && (() => {
        const project = data.projects.find((p) => p.id === drawerState.projectId);
        return (
          <HighlightDrawer
            isOpen={drawerState.isOpen}
            title="编辑项目要点"
            text={project?.highlights[drawerState.highlightIndex] || ''}
            highlightIndex={drawerState.highlightIndex + 1}
            totalCount={project?.highlights.length || 0}
            onTextChange={handleDrawerTextChange}
            onSave={handleDrawerSave}
            onCancel={handleDrawerCancel}
          />
        );
      })()}
    </div>
  );
}
