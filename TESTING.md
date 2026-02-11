# Testing Guide

This document describes the testing infrastructure and best practices for the Stockholm Bus Tracker application.

## Table of Contents

- [Overview](#overview)
- [Backend Testing](#backend-testing)
- [Frontend Testing](#frontend-testing)
- [Running Tests](#running-tests)
- [VSCode Integration](#vscode-integration)
- [GitHub CI/CD](#github-cicd)
- [Writing Tests](#writing-tests)
- [Coverage Requirements](#coverage-requirements)

## Overview

The project uses professional-grade testing infrastructure:

- **Backend**: Jest + ts-jest + Supertest
- **Frontend**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions
- **Coverage**: Comprehensive reporting with thresholds

## Backend Testing

### Tech Stack

- **Jest**: Test framework
- **ts-jest**: TypeScript preprocessor
- **Supertest**: HTTP assertion library

### Directory Structure

```
backend/
├── src/
│   ├── services/
│   ├── controllers/
│   └── utils/
└── tests/
    ├── unit/
    │   ├── services/
    │   ├── controllers/
    │   └── utils/
    ├── integration/
    └── fixtures/
```

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open coverage report in browser
npm run test:coverage:open

# Run tests in CI mode
npm run test:ci

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Backend Test Examples

**Service Test:**
```typescript
describe('SLService', () => {
  it('should search for bus stops', async () => {
    const result = await slService.searchSites('T-Centralen');
    expect(result).toBeDefined();
  });
});
```

**Controller Test:**
```typescript
describe('BusController', () => {
  it('should return bus stop data', async () => {
    await busController.getBusesByStop(mockRequest, mockResponse);
    expect(jsonMock).toHaveBeenCalledWith(mockBusStopData);
  });
});
```

## Frontend Testing

### Tech Stack

- **Vitest**: Fast test framework
- **React Testing Library**: Component testing
- **@testing-library/user-event**: User interaction simulation
- **jsdom**: Browser environment simulation

### Directory Structure

```
frontend/
├── src/
│   ├── components/
│   ├── hooks/
│   └── services/
└── tests/
    ├── unit/
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    └── fixtures/
```

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Open coverage report in browser
npm run test:coverage:open
```

### Frontend Test Examples

**Hook Test:**
```typescript
describe('useBusSearch', () => {
  it('should search for bus stops', async () => {
    const { result } = renderHook(() => useBusSearch());
    await act(async () => {
      await result.current.searchBusStop('T-Centralen');
    });
    expect(result.current.busData).toBeDefined();
  });
});
```

**Component Test:**
```typescript
describe('BusCard', () => {
  it('should render bus information', () => {
    render(<BusCard bus={mockBus} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});
```

## VSCode Integration

### Recommended Extensions

Install these extensions for the best testing experience:

- **Jest** (orta.vscode-jest) - Jest test runner
- **Vitest** (zixuanchen.vitest-explorer) - Vitest test explorer
- **Coverage Gutters** (ryanluker.vscode-coverage-gutters) - Show coverage in editor

### Features

✅ **Click to Run** - Click "Run" above any test
✅ **Inline Results** - See ✓ or ✗ next to tests
✅ **Coverage Gutters** - Green/red indicators in code
✅ **Debugging** - Set breakpoints and debug tests
✅ **Test Explorer** - View all tests in sidebar

### Debugging Tests

1. Open test file
2. Set breakpoints
3. Press F5 or use Debug menu
4. Select "Debug Backend Jest Tests" or "Debug Frontend Vitest Tests"

Or use the debug codelens above test functions.

## GitHub CI/CD

### Workflow

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

### Pipeline Steps

1. **Backend Tests**
   - Lint code
   - Run all tests
   - Upload coverage to Codecov

2. **Frontend Tests**
   - Lint code
   - Run all tests
   - Upload coverage to Codecov

3. **Build**
   - Build backend
   - Build frontend

### Status Checks

- ✅ All tests must pass before merge
- 📊 Coverage reports in PR comments
- 🔍 Lint checks enforce code quality

## Writing Tests

### Best Practices

#### General

- **Write tests first** for new features (TDD)
- **Test behavior, not implementation**
- **Use descriptive test names** (it should...)
- **Keep tests simple and focused** (one assertion concept per test)
- **Use fixtures** for test data
- **Mock external dependencies** (APIs, databases)

#### Backend

```typescript
// ✅ Good - Tests behavior
it('should return 404 when stop is not found', async () => {
  const result = await busController.getBusesByStop(mockReq, mockRes);
  expect(statusMock).toHaveBeenCalledWith(404);
});

// ❌ Bad - Tests implementation
it('should call slService.getBusStopData', async () => {
  await busController.getBusesByStop(mockReq, mockRes);
  expect(slService.getBusStopData).toHaveBeenCalled();
});
```

#### Frontend

```typescript
// ✅ Good - Tests user interaction
it('should search when button is clicked', async () => {
  const user = userEvent.setup();
  render(<BusSearchForm {...props} />);
  await user.click(screen.getByRole('button'));
  expect(mockOnSubmit).toHaveBeenCalled();
});

// ❌ Bad - Tests implementation
it('should have correct state', () => {
  const { result } = renderHook(() => useBusSearch());
  expect(result.current.loading).toBe(false);
});
```

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```typescript
it('should format bus departure correctly', () => {
  // Arrange
  const departure = mockDeparture;

  // Act
  const result = formatDeparture(departure);

  // Assert
  expect(result.line).toBe('4');
  expect(result.destination).toBe('Gullmarsplan');
});
```

## Coverage Requirements

### Thresholds

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Services | 80-90% | High |
| Utilities | 90-100% | High |
| Hooks | 80-90% | High |
| Controllers | 60-70% | Medium |
| Components | 50-60% | Medium |

### Viewing Coverage

**Terminal:**
```bash
npm run test:coverage
```

**HTML Report:**
```bash
npm run test:coverage:open
```

**VSCode:**
- Install "Coverage Gutters" extension
- Run tests with coverage
- Click "Watch" in status bar

### Coverage Reports

Coverage reports are generated in:
- `backend/coverage/` - Backend coverage
- `frontend/coverage/` - Frontend coverage

Open `coverage/index.html` in a browser for detailed reports.

## Troubleshooting

### Backend

**Issue**: Tests timeout
**Solution**: Increase timeout in jest.config.js or individual test

**Issue**: Mocks not working
**Solution**: Ensure `jest.clearAllMocks()` in `beforeEach`

### Frontend

**Issue**: "Cannot find module"
**Solution**: Check import paths and vitest.config.ts aliases

**Issue**: "Not wrapped in act(...)"
**Solution**: Wrap state updates in `act()` or use `waitFor()`

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Questions?** Check the test files in `tests/` directories for examples or open an issue.
