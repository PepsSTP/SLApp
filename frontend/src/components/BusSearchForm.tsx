interface BusSearchFormProps {
  busStopName: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (value: string) => void;
}

/**
 * Bus Search Form Component
 * Input form for searching bus stops
 */
export function BusSearchForm({
  busStopName,
  loading,
  onSubmit,
  onChange
}: BusSearchFormProps) {
  return (
    <form onSubmit={onSubmit} className="bus-form">
      <input
        type="text"
        placeholder="Enter bus stop name (e.g., Central Station)"
        value={busStopName}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
      />
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
