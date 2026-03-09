# SLApp — Application Specification

## 1. Purpose

SLApp is a personal Stockholm public transport dashboard. It shows real-time departures from a fixed set of stops relevant to a single commuter's daily routes — from home to work/city destinations, and back home again. The intention is to serve people living specifically at Högsjövägen 4 in Älvsjö.

The app is intentionally opinionated: it is not a general-purpose transit planner. It solves one problem well — *"which bus/metro should I catch right now?"* — without requiring the user to search, filter, or configure anything during normal use.

---

## 2. Target User

A single commuter living at Högsjövägen 4 in Älvjö, which is near to **Helgestavägen / Juliaborg / Bandhagen** in Stockholm, commuting to destinations including **Älvsjö Station**, **Enskede**, and **Gullmarsplan**.

Future versions may support multiple user profiles or user-configurable stops, but the core UX should always prioritise speed and immediacy over configurability.

---

## 3. Core Features (must always work)

These are non-negotiable. Any change to the app must preserve these behaviours.

1. **From Home view** — Shows departures from home stops, grouped by destination area (Älvsjö Station, Enskede, Gullmarsplan).
2. **To Home view** — Shows departures from destination stops back towards home, grouped by return location (Gullmarsplan, Älvsjö Station, Enskede).
3. **Real-time data** — Departures are fetched from the Stockholm SL Transport API and reflect live times.
4. **Auto-refresh** — Data refreshes automatically every 30 seconds without user interaction.
5. **Manual refresh** — A refresh button lets the user force an immediate update.
6. **Relative + absolute times** — Each departure shows both a relative time ("5 min", "Now") and a clock time ("08:42").
7. **Urgency indicators** — Departures are visually differentiated by imminence (e.g. leaving soon vs. comfortable time).
8. **Grouped by line** — Departures are grouped by line number and final destination within each destination area.
9. **Transport mode filtering** — Bandhagen shows Metro only (bus departures from that stop are irrelevant to this commuter).
10. **Graceful error handling** — API failures show a user-friendly message, not a broken UI or raw error.

---

## 4. Stop & Route Configuration

### Home Stops
Stops near home from which the user departs:
- `Helgestavägen (på Årdalavägen)`
- `Bandhagen` (Metro only)
- `Juliaborg`

### Return Stops
Destination stops from which the user returns home:
- `Gullmarsplan`
- `Älvsjö station`
- `Sockenplan`
- `Murklevägen`

### From Home — Destination Groups

| Display Name | Lines & Destinations |
|---|---|
| To Älvsjö Station | 144→Fruängen, 144→Älvsjö station, 173→Skärholmen, 161→Gröndal, 163→Bredäng |
| To Enskede | 163→Kärrtorp, 161→Bagarmossen |
| To Gullmarsplan | 144→Gullmarsplan, Metro 19→Hässelby strand |

### To Home — Destination Groups

| Display Name | Origin Stop | Lines & Destinations |
|---|---|---|
| From Gullmarsplan | Gullmarsplan | 144→Fruängen, 144→Älvsjö station, Metro 19→Hagsätra |
| From Älvsjö Station | Älvsjö | 144→Gullmarsplan, 173→Skarpnäck, 163→Kärrtorp, 161→Bagarmossen, 161→Gröndal |
| From Enskede | Sockenplan / Murklevägen | 163→Kärrtorp, 163→Bredäng, 161→Gröndal |

---

## 5. Data Flow

```
User opens app
  │
  ▼
Frontend (React/Vite on Vercel)
  │  fetches HOME_STOPS + RETURN_STOPS in parallel
  ▼
Backend (Express on Railway)
  │  GET /api/buses/:stopName/grouped
  ▼
SL Transport API (transport.integration.sl.se/v1)
  │  stop lookup by name → fetch departures
  ▼
Backend formats + groups departures by line & destination
  │
  ▼
Frontend merges stops into destination groups
  │  filters by time window, renders cards
  ▼
Auto-refresh every 30s repeats the cycle
```

### Stop Lookup Strategy
The backend resolves stop names to SL stop IDs using a fuzzy match:
1. Exact name match
2. Alias match (configured per stop)
3. First result fallback

Stop ID lookups should be cached — IDs do not change and re-fetching them on every request is wasteful.

---

## 6. API

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/buses/:stopName` | Raw departures for a stop |
| GET | `/api/buses/:stopName/grouped` | Departures grouped by line + destination |
| GET | `/health` | Health check |

### Response — Grouped Departures

```ts
interface GroupedResponse {
  stopName: string;
  groups: LineGroup[];
}

interface LineGroup {
  line: string;
  destination: string;
  departures: Departure[];
}

interface Departure {
  scheduledTime: string;   // ISO 8601
  expectedTime: string;    // ISO 8601
  transportMode: string;   // "BUS" | "METRO" | "TRAM" | "TRAIN"
  direction: string;
}
```

### Error Responses

| Status | Meaning |
|---|---|
| 404 | Stop not found in SL API |
| 429 | Rate limit exceeded (60 req/min per IP) |
| 502/503 | SL API unavailable |
| 500 | Unexpected server error |

---

## 7. Non-Functional Requirements

| Concern | Requirement |
|---|---|
| Refresh interval | 30 seconds (configurable in future) |
| Time window | Show departures within the next 30–90 min |
| Rate limiting | 60 requests/min per IP (backend) |
| CORS | Backend only accepts requests from the configured frontend origin |
| Security headers | Helmet middleware applied on all responses |
| Transport | HTTPS only in production |
| Deployment | Backend on Railway, frontend on Vercel |
| CI | GitHub Actions: lint + test + build on every push |

---

## 8. Architecture

### Frontend
```
DestinationDashboard
├── ViewToggle              — switches between From Home / To Home
├── DestinationGroup[]      — one per destination area
│   └── LineGroup[]         — one per line + destination combo
│       └── BusCard[]       — one per departure
├── useDestinationView      — manages view state, refresh timer, data fetching
└── busService              — axios HTTP client, error parsing
```

### Backend
```
Express Server
├── Routes:      /api/buses/:stopName, /api/buses/:stopName/grouped
├── Controller:  BusController — request handling, error routing
├── Service:     SLService — SL API orchestration, stop lookup, departure fetch
└── Utils:
    ├── departureFormatter — normalises SL API response shape
    └── lineGrouper        — groups departures by line + destination
```

---

## 9. Roadmap

Issues are tracked in Linear (project: PepsSTP).

### Near-term
| ID | Issue |
|---|---|
| PEP-5 | Mobile-responsive layout |
| PEP-6 | User-configurable stops via UI |
| PEP-7 | Server-side caching for SL API responses |
| PEP-8 | Retry backoff + circuit breaker for SL API errors |
| PEP-9 | ARIA live regions for real-time updates |

### Medium-term
| ID | Issue |
|---|---|
| PEP-10 | Configurable refresh interval and time window |
| PEP-11 | OpenAPI/Swagger documentation |
| PEP-12 | Replace polling with WebSocket push |

### Possible future scope
- User authentication (if the app becomes multi-user)
- Persistent configuration storage (database or cloud sync)
- Service worker for offline support
- Push notifications for imminent departures

---

## 10. Out of Scope

These are explicitly not goals for this application:

- General-purpose stop search for arbitrary Stockholm locations
- Journey planning (multi-leg routes, transfers)
- Ticket purchasing or SL account integration
- Historical departure data or statistics
- Support for transport outside Stockholm / SL network
