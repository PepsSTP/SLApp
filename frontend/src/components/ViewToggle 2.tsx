export type ViewType = 'from-home' | 'to-home';

interface ViewToggleProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="tab-group">
      <button
        className={`tab-btn ${currentView === 'from-home' ? 'active' : ''}`}
        onClick={() => onViewChange('from-home')}
      >
        From Home
      </button>
      <button
        className={`tab-btn ${currentView === 'to-home' ? 'active' : ''}`}
        onClick={() => onViewChange('to-home')}
      >
        To Home
      </button>
    </div>
  );
}
