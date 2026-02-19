import { useMultiStopDepartures } from '../hooks/useMultiStopDepartures';
import { StationCard } from './StationCard';

// Preset stops to display
const PRESET_STOPS = ['Helgestavägen (på Årdalavägen)', 'Bandhagen', 'Juliaborg'];

/**
 * Helper function to format last updated time
 */
function formatTimeSince(date: Date | null): string {
  if (!date) return '';

  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 10) {
    return 'just now';
  } else if (diffSeconds < 60) {
    return `${diffSeconds} sec ago`;
  } else {
    const diffMinutes = Math.floor(diffSeconds / 60);
    return diffMinutes === 1 ? '1 min ago' : `${diffMinutes} min ago`;
  }
}

/**
 * DashboardView Component
 * Main dashboard that displays real-time departures for multiple preset stops
 */
export function DashboardView() {
  const { stops, loading, errors, lastUpdated, refresh } = useMultiStopDepartures(PRESET_STOPS);

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div className="dashboard-info">
          <h1>Stockholm Transport Dashboard</h1>
          <p className="dashboard-subtitle">
            Live departures • Updated {formatTimeSince(lastUpdated)}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="refresh-button"
        >
          {loading ? 'Refreshing...' : 'Refresh Now'}
        </button>
      </div>

      {loading && stops.length === 0 && (
        <div className="loading-state">
          <p>Loading departure information...</p>
        </div>
      )}

      <div className="stations-container">
        {stops.map((stopData, index) => (
          <StationCard
            key={stopData.stopName}
            stopData={stopData}
            error={errors[PRESET_STOPS[index]]}
          />
        ))}

        {/* Display error-only cards for stops that failed to load */}
        {Object.keys(errors).map(stopName => {
          const hasStopData = stops.some(s => s.stopName === stopName);
          if (hasStopData) return null;

          return (
            <div key={stopName} className="station-card error-card">
              <div className="station-header">
                <h2>{stopName}</h2>
              </div>
              <div className="error-message">
                <p>{errors[stopName]}</p>
                <button onClick={refresh} className="retry-button">
                  Retry
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
