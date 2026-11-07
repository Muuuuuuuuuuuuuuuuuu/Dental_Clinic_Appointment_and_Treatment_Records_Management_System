import QueueTitleBar from "./QueueTitleBar";
import QueueViewToggle from "./QueueViewToggle";
import { ViewMode } from "../hooks/useQueueData";

interface QueueHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function QueueHeader({ viewMode, onViewModeChange }: QueueHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <QueueTitleBar />
      <QueueViewToggle mode={viewMode} setMode={onViewModeChange} />
    </div>
  );
}
