# SLApp

A personal Stockholm public transport dashboard. Shows real-time departures from a fixed set of stops for a specific commuter's daily routes — from home to work destinations, and back.

Built with React + TypeScript on the frontend (Vercel) and Node.js/Express on the backend (Railway), pulling live data from the Stockholm SL Transport API.

## Documentation

See [SPEC.md](SPEC.md) for full details on features, architecture, API, stop configuration, and roadmap.

## Development

### Prerequisites
- Node.js 20.x

### Running locally

```bash
# Backend (http://localhost:3001)
cd backend && npm install && npm run dev

# Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

### Environment variables

**Backend** (Railway):
```
PORT=3001
FRONTEND_URL=http://localhost:5173
```

**Frontend** (Vercel):
```
VITE_API_BASE_URL=http://localhost:3001
```

### Tests

```bash
cd backend && npm test
cd frontend && npm test
```

## Deployment

- Frontend: Vercel — deploys automatically on push to `main`
- Backend: Railway — deploys automatically on push to `main`

> Note: Vercel env var changes require a new git push to take effect (redeploy alone may use cached build).
