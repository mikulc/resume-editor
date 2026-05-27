import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(
    (result: boolean) => {
      if (state) {
        state.resolve(result);
        setState(null);
      }
    },
    [state],
  );

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state &&
        createPortal(
          <div
            className="fixed inset-0 z-[9998] flex items-center justify-center"
            onClick={() => handleClose(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm modal-backdrop-enter" />

            {/* Dialog */}
            <div
              className="relative bg-white rounded-xl shadow-2xl p-6 w-[380px] max-w-[90vw] modal-dialog-enter"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Title */}
              <h3 className="text-base font-semibold text-gray-800 mb-2">{state.title}</h3>

              {/* Message */}
              <p className="text-sm text-gray-500 leading-relaxed mb-6">{state.message}</p>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {state.cancelText || '取消'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                    state.confirmVariant === 'danger'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {state.confirmText || '确认重置'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}
