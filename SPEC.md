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
9. **Transport mode filtering** — Handled implicitly by the origin→destination route configuration and line filtering in the backend.
10. **Graceful error handling** — API failures show a user-friendly message, not a broken UI or raw error.

---

## 4. Stop & Route Configuration

Routes are configured as origin → destination stop pairs, grouped by display destination. The Journey Planner API resolves which departures serve each pair.

### From Home — Destination Groups

| Display Name | Line | Origin Stop | Destination Stop |
|---|---|---|---|
| To Älvsjö Station | 161 | Helgestavägen (på Årdalavägen) | Älvsjö station |
| | 144 | Juliaborg | Älvsjö station |
| | 173 | Juliaborg | Älvsjö station |
| | 163 | Juliaborg | Älvsjö station |
| | 803 | Juliaborg | Älvsjö station |
| To Enskede | 161 | Helgestavägen (på Årdalavägen) | Murklevägen |
| | 163 | Juliaborg | Sockenplan |
| | Metro 19 | Bandhagen | Sockenplan |
| To Gullmarsplan | 144 | Juliaborg | Gullmarsplan |
| | Metro 19 | Bandhagen | Gullmarsplan |

### To Home — Destination Groups

| Display Name | Line | Origin Stop | Destination Stop |
|---|---|---|---|
| From Gullmarsplan | Metro 19 | Gullmarsplan | Bandhagen |
| | 144 | Gullmarsplan | Juliaborg |
| From Älvsjö Station | 161 | Älvsjö station | Helgestavägen (på Årdalavägen) |
| | 163 | Älvsjö station | Juliaborg |
| | 144 | Älvsjö station | Juliaborg |
| | 173 | Älvsjö station | Juliaborg |
| | 803 | Älvsjö station | Juliaborg |
| From Enskede | 163 | Sockenplan | Juliaborg |
| | Metro 19 | Sockenplan | Bandhagen |
| | 161 | Murklevägen | Helgestavägen (på Årdalavägen) |

---

## 5. Data Flow

```
User opens app
  │
  ▼
Frontend (React/Vite on Vercel)
  │  for each unique origin+destination pair, calls
  │  GET /api/journeys?origin=...&destination=...&lines=...
  ▼
Backend (Express on Railway)
  │  resolves stop names → calls Journey Planner API
  ▼
SL Journey Planner API
  │  returns matching journeys for origin→destination
  ▼
Backend filters by requested lines, formats response
  │
  ▼
Frontend merges journey results into destination groups
  │  sorts by departure time, renders cards
  ▼
Auto-refresh every 30s repeats the cycle
```

### "Show More" Flow
When the user requests more departures, the frontend calls `/api/journeys` with an `after` parameter set to the last visible departure time. The backend passes this as `itdDate`/`itdTime` to the Journey Planner API to fetch later departures.

---

## 6. API

### Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/buses/:stopName` | Raw departures for a stop |
| GET | `/api/buses/:stopName/grouped` | Departures grouped by line + destination |
| GET | `/api/journeys` | Journey Planner: journeys from origin to destination |
| GET | `/health` | Health check |

### Query Parameters — `/api/journeys`

| Parameter | Required | Description |
|---|---|---|
| `origin` | Yes | Origin stop name |
| `destination` | Yes | Destination stop name |
| `lines` | Yes | Comma-separated line numbers to filter by |
| `after` | No | ISO 8601 timestamp; fetch journeys departing after this time |

### Response — Journeys

```ts
interface JourneyResponse {
  origin: string;
  destination: string;
  journeys: JourneyDeparture[];
}

interface JourneyDeparture {
  line: string;
  transportMode: string;    // "BUS" | "METRO" | "TRAM" | "TRAIN"
  origin: string;
  destination: string;
  departureTime: string;           // ISO 8601
  arrivalTime: string;             // ISO 8601
  scheduledDepartureTime: string;  // ISO 8601
  scheduledArrivalTime: string;    // ISO 8601
}
```

### Response — Grouped Departures (legacy)

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
| Time window | Default 30 min; expandable to 60 min via "Show more" button |
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
│   ├── departure rows      — sorted by time, filtered by time window
│   ├── Show more/less      — expands window from 30 → 60 min
│   └── DepartureDetail     — modal/bottom sheet shown on row tap
├── useDestinationView      — manages view state, refresh timer, data fetching
└── busService              — HTTP client, error parsing
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

### In Review / Todo
| ID | Issue | Status |
|---|---|---|
| PEP-13 | Tap departure to view full details | In Review |
| PEP-14 | Fix departure detail sheet obscured by bottom nav on mobile | Todo |
| PEP-15 | Fix departure cap cutting off "Show more" on combined destination groups | Todo |

### Backlog
| ID | Issue |
|---|---|
| PEP-6 | User-configurable stops via UI |
| PEP-7 | Server-side caching for SL API responses |
| PEP-8 | Retry backoff + circuit breaker for SL API errors |
| PEP-9 | ARIA live regions for real-time updates |
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
