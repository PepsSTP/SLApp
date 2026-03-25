import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MergedDeparture } from '../utils/destinationGrouper';

interface DepartureDetailProps {
  departure: MergedDeparture;
  onClose: () => void;
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

function formatRelativeTime(isoTime: string): string {
  try {
    const now = new Date();
    const departure = new Date(isoTime);
    const diffMinutes = Math.floor((departure.getTime() - now.getTime()) / 60000);
    if (diffMinutes < 0) return 'Departed';
    if (diffMinutes === 0) return 'Now';
    if (diffMinutes === 1) return '1 min';
    return `${diffMinutes} min`;
  } catch {
    return '';
  }
}

function formatTransportMode(transportMode: string): string {
  switch (transportMode) {
    case 'METRO': return 'Metro';
    case 'TRAM': return 'Tram';
    case 'TRAIN': return 'Train';
    case 'BUS': return 'Bus';
    default: return transportMode;
  }
}

function formatLineName(line: string): string {
  return line.replace(/^(Metro|Tram|Train)\s+/, '');
}

function getLineBadgeClass(transportMode: string): string {
  switch (transportMode) {
    case 'METRO': return 'badge-metro';
    case 'TRAM': return 'badge-tram';
    case 'TRAIN': return 'badge-train';
    default: return 'badge-bus';
  }
}

export function DepartureDetail({ departure, onClose }: DepartureDetailProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const scheduledTime = formatAbsoluteTime(departure.scheduled);
  const expectedTime = formatAbsoluteTime(departure.departureTime);
  const relativeTime = formatRelativeTime(departure.departureTime);
  const timesAreSame = departure.scheduled === departure.departureTime;

  return createPortal(
    <div className="detail-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Departure details">
      <div className="detail-sheet">
        <div className="detail-header">
          <span className={`line-badge ${getLineBadgeClass(departure.transportMode)}`}>
            {formatLineName(departure.line)}
          </span>
          <span className="detail-mode">{formatTransportMode(departure.transportMode)}</span>
          <button className="detail-close" onClick={onClose} aria-label="Close">
            &#x2715;
          </button>
        </div>

        <dl className="detail-fields">
          <div className="detail-field">
            <dt>From</dt>
            <dd>{departure.originStop}</dd>
          </div>

          <div className="detail-field">
            <dt>To</dt>
            <dd>{departure.destination}</dd>
          </div>

          {timesAreSame ? (
            <div className="detail-field">
              <dt>Departure</dt>
              <dd>
                <span className="detail-time-primary">{expectedTime}</span>
                <span className="detail-time-relative">{relativeTime}</span>
              </dd>
            </div>
          ) : (
            <>
              <div className="detail-field">
                <dt>Scheduled</dt>
                <dd>
                  <span className="detail-time-primary">{scheduledTime}</span>
                </dd>
              </div>
              <div className="detail-field">
                <dt>Expected</dt>
                <dd>
                  <span className="detail-time-primary">{expectedTime}</span>
                  <span className="detail-time-relative">{relativeTime}</span>
                </dd>
              </div>
            </>
          )}
        </dl>
      </div>
    </div>,
    document.body
  );
}
