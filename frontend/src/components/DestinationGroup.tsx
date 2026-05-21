import { useState } from 'react';
import { DestinationGroupResult, MergedDeparture } from '../utils/destinationGrouper';
import { DepartureDetail } from './DepartureDetail';

interface DestinationGroupProps {
  groupResult: DestinationGroupResult;
  /** Whether this group starts collapsed */
  defaultCollapsed?: boolean;
  /** Callback to load more departures beyond the initial window */
  onLoadMore?: () => void;
}

interface DepartureRowsProps {
  departures: MergedDeparture[];
  windowMinutes: number;
  onShowMore: () => void;
  onShowLess: () => void;
  onLoadMore?: () => void;
  onSelectDeparture: (d: MergedDeparture) => void;
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

function DepartureRows({ departures, windowMinutes, onShowMore, onShowLess, onLoadMore, onSelectDeparture }: DepartureRowsProps) {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const upcoming = departures.filter(d => new Date(d.departureTime).getTime() > now);
  const visible = upcoming.filter(d => new Date(d.departureTime).getTime() - now <= windowMs);
  const hasMoreInWindow = windowMinutes < MAX_WINDOW && upcoming.some(d => new Date(d.departureTime).getTime() - now > windowMs);
  const hasLess = windowMinutes > WINDOW_STEP;
  const canShowMore = hasMoreInWindow || (!!onLoadMore && windowMinutes >= MAX_WINDOW);

  if (upcoming.length === 0) {
    return <div className="no-departures"><p>No upcoming departures</p></div>;
  }

  const handleShowMore = () => hasMoreInWindow ? onShowMore() : onLoadMore?.();

  return (
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
              onClick={() => onSelectDeparture(departure)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectDeparture(departure); } }}
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
      {(canShowMore || hasLess) && (
        <div className="show-more-bar">
          {hasLess && <button className="show-window-btn" onClick={onShowLess}>Show less</button>}
          {canShowMore && <button className="show-window-btn" onClick={handleShowMore}>Show more</button>}
        </div>
      )}
    </>
  );
}

export function DestinationGroup({ groupResult, defaultCollapsed = false, onLoadMore }: DestinationGroupProps) {
  const { displayName, departures } = groupResult;
  const [windowMinutes, setWindowMinutes] = useState(WINDOW_STEP);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [selectedDeparture, setSelectedDeparture] = useState<MergedDeparture | null>(null);

  const now = Date.now();
  const firstUpcoming = departures.find(d => new Date(d.departureTime).getTime() > now);
  const summaryText = firstUpcoming
    ? `Next: ${formatRelativeTime(getMinutesUntil(firstUpcoming.departureTime))}`
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
        <DepartureRows
          departures={departures}
          windowMinutes={windowMinutes}
          onShowMore={() => setWindowMinutes(w => w + WINDOW_STEP)}
          onShowLess={() => setWindowMinutes(w => w - WINDOW_STEP)}
          onLoadMore={onLoadMore}
          onSelectDeparture={setSelectedDeparture}
        />
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
