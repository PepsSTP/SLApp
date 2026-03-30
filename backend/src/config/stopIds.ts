/**
 * Hardcoded stop IDs for the SL Journey Planner API.
 * Keys are stop names (case-insensitive lookup), values are SL stop IDs.
 */
const STOP_IDS: Record<string, string> = {
  'Helgestavägen (på Årdalavägen)': '9091001000001954',
  'Juliaborg': '9091001000001700',
  'Bandhagen': '9091001000009163',
  'Gullmarsplan': '9091001000009189',
  'Älvsjö station': '9091001003009529',
  'Sockenplan': '9091001000009166',
  'Murklevägen': '9091001000001855',
};

/**
 * Look up a stop ID by name (case-insensitive).
 * Returns undefined if the stop name is not recognised.
 */
export function getStopId(stopName: string): string | undefined {
  const lower = stopName.toLowerCase();
  for (const [name, id] of Object.entries(STOP_IDS)) {
    if (name.toLowerCase() === lower) {
      return id;
    }
  }
  return undefined;
}

export default STOP_IDS;
