import { ViewType } from './ViewToggle';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="View navigation">
      <button
        className={`bottom-nav-btn ${currentView === 'from-home' ? 'active' : ''}`}
        onClick={() => onViewChange('from-home')}
        aria-current={currentView === 'from-home' ? 'page' : undefined}
      >
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        From Home
      </button>
      <button
        className={`bottom-nav-btn ${currentView === 'to-home' ? 'active' : ''}`}
        onClick={() => onViewChange('to-home')}
        aria-current={currentView === 'to-home' ? 'page' : undefined}
      >
        <svg className="bottom-nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 2.84L18 11v7h-2v-6H8v6H6v-7l6-5.16z" />
        </svg>
        To Home
      </button>
    </nav>
  );
}
