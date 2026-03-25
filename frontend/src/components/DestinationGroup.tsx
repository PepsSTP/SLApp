import { useState } from 'react';
import { DestinationGroupResult, MergedDeparture } from '../utils/destinationGrouper';
import { DepartureDetail } from './DepartureDetail';

interface DestinationGroupProps {
  groupResult: DestinationGroupResult;
  /** Whether this group starts collapsed */
  defaultCollapsed?: boolean;
}

const WINDOW_STEP = 30;
const MAX_WINDOW = 60;

function getMinutesUntil(isoTime: string): number {
  const now = new Date();
  const departure = new Date(isoTime);
  return Math.floor((departure.getTime() - now.getTime()) / 60000);
}

function formatRelativeTime(diffMinutes: number): string {
  if (diffMinutes < 0) return 'Departed';
  if (diffMinutes === 0) return 'Now';
  if (diffMinutes === 1) return '1 min';
  return `${diffMinutes} min`;
}

function formatAbsoluteTime(isoTime: string): string {
  try {
    return new Date(isoTime).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '';
  }
}

function getUrgencyClass(diffMinutes: number): string {
  if (diffMinutes < 0) return 'time-departed';
  if (diffMinutes <= 2) return 'time-urgent';
  if (diffMinutes <= 8) return 'time-soon';
  return 'time-later';
}

function getLineBadgeClass(transportMode: string): string {
  switch (transportMode) {
    case 'METRO': return 'badge-metro';
    case 'TRAM': return 'badge-tram';
    case 'TRAIN': return 'badge-train';
    default: return 'badge-bus';
  }
}

function formatLineName(line: string): string {
  return line.replace(/^(Metro|Tram|Train)\s+/, '');
}

function shortenStopName(stopName: string): string {
  const match = stopName.match(/^([^(]+)/);
  return match ? match[1].trim() : stopName;
}

export function DestinationGroup({ groupResult, defaultCollapsed = false }: DestinationGroupProps) {
  const { displayName, departures } = groupResult;
  const [windowMinutes, setWindowMinutes] = useState(WINDOW_STEP);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [selectedDeparture, setSelectedDeparture] = useState<MergedDeparture | null>(null);

  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;

  const upcoming = departures.filter(d => new Date(d.departureTime).getTime() > now);
  const visible = upcoming.filter(d => new Date(d.departureTime).getTime() - now <= windowMs);
  const hasMore = windowMinutes < MAX_WINDOW && upcoming.some(d => new Date(d.departureTime).getTime() - now > windowMs);
  const hasLess = windowMinutes > WINDOW_STEP;

  // Summary for collapsed state: show the nearest departure time
  const nextDeparture = upcoming.length > 0 ? getMinutesUntil(upcoming[0].departureTime) : null;
  const summaryText = nextDeparture !== null
    ? `Next: ${formatRelativeTime(nextDeparture)}`
    : 'No departures';

  return (
    <div className={`dest-card ${collapsed ? 'dest-card--collapsed' : ''}`}>
      <button
        className="dest-card-header"
        onClick={() => setCollapsed(c => !c)}
        aria-expanded={!collapsed}
      >
        <h2 className="dest-title">{displayName}</h2>
        <span className="dest-header-right">
          {collapsed && <span className="dest-summary">{summaryText}</span>}
          <span className={`dest-chevron ${collapsed ? '' : 'dest-chevron--open'}`} aria-hidden="true">
            &#x25B8;
          </span>
        </span>
      </button>

      {!collapsed && (
        <>
          {upcoming.length === 0 ? (
            <div className="no-departures">
              <p>No upcoming departures</p>
            </div>
          ) : (
            <>
              <ul className="departure-rows">
                {visible.map((departure, index) => {
                  const diffMinutes = getMinutesUntil(departure.departureTime);
                  return (
                    <li
                      key={index}
                      className="departure-row departure-row--tappable"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedDeparture(departure)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDeparture(departure); } }}
                    >
                      <span className={`departure-time ${getUrgencyClass(diffMinutes)}`}>
                        {formatRelativeTime(diffMinutes)}
                      </span>
                      <span className={`line-badge ${getLineBadgeClass(departure.transportMode)}`}>
                        {formatLineName(departure.line)}
                      </span>
                      <span className="departure-origin">
                        <span className="departure-origin-name">{shortenStopName(departure.originStop)}</span>
                        <span className="departure-clock">{formatAbsoluteTime(departure.departureTime)}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>

              {(hasMore || hasLess) && (
                <div className="show-more-bar">
                  {hasLess && (
                    <button className="show-window-btn" onClick={() => setWindowMinutes(w => w - WINDOW_STEP)}>
                      Show less
                    </button>
                  )}
                  {hasMore && (
                    <button className="show-window-btn" onClick={() => setWindowMinutes(w => w + WINDOW_STEP)}>
                      Show more
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {selectedDeparture && (
        <DepartureDetail
          departure={selectedDeparture}
          onClose={() => setSelectedDeparture(null)}
        />
      )}
    </div>
  );
}
