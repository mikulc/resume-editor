import { EditorPanel } from './EditorPanel';
import { PreviewPanel } from './PreviewPanel';
import { SettingsPanel } from './SettingsPanel';
import { useAppUI } from '../../context/ResumeContext';
import { SaveSync } from '../common/SaveSync';

interface SplitLayoutProps {
  previewRef: React.RefObject<HTMLDivElement>;
  isExporting: boolean;
  onExportPDF: () => void;
}

export function SplitLayout({ previewRef, isExporting, onExportPDF }: SplitLayoutProps) {
  const { ui } = useAppUI();

  return (
    <SaveSync>
      <div className="h-screen flex flex-col overflow-hidden bg-slate-50">

        {/* Three-Column Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Editor Panel */}
          <div className="w-[300px] min-w-[280px] flex-shrink-0 no-print border-r border-gray-200 bg-white">
            <EditorPanel />
          </div>

          {/* Center: Preview Canvas */}
          <div className="flex-1 min-w-[500px] overflow-hidden">
            <PreviewPanel previewRef={previewRef} isExporting={isExporting} onExportPDF={onExportPDF} />
          </div>

          {/* Right: Settings Panel (collapsible) */}
          {ui.settingsOpen && (
            <div className="w-[300px] min-w-[280px] flex-shrink-0 no-print border-l border-gray-200 bg-white">
              <SettingsPanel />
            </div>
          )}
        </div>
      </div>
    </SaveSync>
  );
}
