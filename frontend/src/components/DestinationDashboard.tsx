import { useDestinationView } from '../hooks/useDestinationView';
import { ViewToggle } from './ViewToggle';
import { DestinationGroup } from './DestinationGroup';

function formatTimeSince(date: Date | null): string {
  if (!date) return '';
  const diffSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diffSeconds < 10) return 'just now';
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} min ago`;
}

export function DestinationDashboard() {
  const {
    destinationGroups,
    loading,
    errors,
    lastUpdated,
    currentView,
    setView,
    refresh,
  } = useDestinationView();

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="dashboard">
      <header className="top-bar">
        <ViewToggle currentView={currentView} onViewChange={setView} />
        <button
          className="refresh-btn"
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh"
        >
          <svg
            className={`refresh-icon ${loading ? 'spinning' : ''}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          {lastUpdated && (
            <span className="refresh-label">{formatTimeSince(lastUpdated)}</span>
          )}
        </button>
      </header>

      <main className="content-area">
        {loading && destinationGroups.length === 0 && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading departures...</p>
          </div>
        )}

        {hasErrors && (
          <div className="error-banner">
            {Object.entries(errors).map(([stopName, error]) => (
              <p key={stopName}><strong>{stopName}:</strong> {error}</p>
            ))}
          </div>
        )}

        <div className="dest-list" key={currentView}>
          {destinationGroups.map((group) => (
            <DestinationGroup key={group.displayName} groupResult={group} />
          ))}

          {!loading && destinationGroups.length === 0 && !hasErrors && (
            <div className="empty-state">
              <p>No departures found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
