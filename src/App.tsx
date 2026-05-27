import { ResumeProvider, AppProvider, useAppUI } from './context/ResumeContext';
import { SplitLayout } from './components/layout/SplitLayout';
import { useExportPDF } from './hooks/useExportPDF';
import { ToastProvider } from './components/common/Toast';
import { ConfirmProvider } from './components/common/ConfirmModal';

function AppContent() {
  const { ui } = useAppUI();
  const { previewRef, exportPDF, isExporting } = useExportPDF(ui.theme.exportScale);

  return (
    <SplitLayout
      previewRef={previewRef}
      isExporting={isExporting}
      onExportPDF={exportPDF}
    />
  );
}

function App() {
  return (
    <ResumeProvider>
      <AppProvider>
        <ToastProvider>
          <ConfirmProvider>
            <AppContent />
          </ConfirmProvider>
        </ToastProvider>
      </AppProvider>
    </ResumeProvider>
  );
}

export default App;
