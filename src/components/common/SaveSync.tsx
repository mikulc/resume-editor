import React, { useRef, useCallback, useEffect } from 'react';
import { useResume, useAppUI } from '../../context/ResumeContext';

const STORAGE_KEY = 'resume-editor-data';

// Module-level ref for retry callback — accessed by SaveStatusIndicator
let retrySaveRef: (() => void) | null = null;
export function triggerRetrySave() {
  retrySaveRef?.();
}

export function SaveSync({ children }: { children?: React.ReactNode }) {
  const { data } = useResume();
  const { ui, uiDispatch } = useAppUI();

  // Track the data snapshot we last considered "saved"
  const lastSavedDataRef = useRef<string>(JSON.stringify(data));
  const isSavingRef = useRef(false);
  const dataChangedBySaveRef = useRef(false);

  // Direct save to localStorage (bypasses debounce)
  const performSave = useCallback(() => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    uiDispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });

    try {
      const currentData = lastSavedDataRef.current;
      localStorage.setItem(STORAGE_KEY, currentData);

      // Mark that data changed due to our own save
      dataChangedBySaveRef.current = true;

      // Brief delay to show "saving..." state
      setTimeout(() => {
        uiDispatch({ type: 'TRIGGER_SAVE_ANIMATION' });
        lastSavedDataRef.current = currentData;
        isSavingRef.current = false;
      }, 300);
    } catch (e) {
      console.error('Save failed:', e);
      uiDispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      isSavingRef.current = false;
    }
  }, [uiDispatch]);

  // Handle retry from error state
  const handleRetry = useCallback(() => {
    if (ui.saveStatus === 'error') {
      const currentDataStr = JSON.stringify(data);
      lastSavedDataRef.current = currentDataStr;
      performSave();
    }
  }, [ui.saveStatus, data, performSave]);

  // Register retry handler
  useEffect(() => {
    retrySaveRef = handleRetry;
    return () => {
      retrySaveRef = null;
    };
  }, [handleRetry]);

  // Compare data with last saved snapshot — detect unsaved changes
  const currentDataStr = JSON.stringify(data);

  useEffect(() => {
    // Skip if we just completed a save
    if (dataChangedBySaveRef.current) {
      dataChangedBySaveRef.current = false;
      return;
    }

    // Skip if currently saving
    if (isSavingRef.current) return;

    if (currentDataStr !== lastSavedDataRef.current) {
      if (ui.saveStatus !== 'unsaved') {
        uiDispatch({ type: 'SET_SAVE_STATUS', payload: 'unsaved' });
      }
    }
  }, [currentDataStr, ui.saveStatus, uiDispatch]);

  // Intercept Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        e.stopPropagation();

        // Snapshot the latest data
        lastSavedDataRef.current = JSON.stringify(data);
        performSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [performSave, data]);

  return <>{children}</>;
}
