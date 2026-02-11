import './App.css';
import { useBusSearch } from './hooks/useBusSearch';
import { BusSearchForm } from './components/BusSearchForm';
import { BusResults } from './components/BusResults';
import { ErrorMessage } from './components/ErrorMessage';

/**
 * Main App Component
 * Stockholm Bus Tracker application
 */
function App() {
  const {
    busStopName,
    busData,
    loading,
    error,
    setBusStopName,
    handleSubmit
  } = useBusSearch();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stockholm Bus Tracker</h1>
        <p>Check real-time bus arrivals from SL (Stockholms Lokaltrafik)</p>
      </header>

      <main className="App-main">
        <section className="bus-section">
          <h2>Find Buses</h2>

          <BusSearchForm
            busStopName={busStopName}
            loading={loading}
            onSubmit={handleSubmit}
            onChange={setBusStopName}
          />

          {error && <ErrorMessage message={error} />}

          {busData && <BusResults data={busData} />}
        </section>
      </main>

      <footer className="App-footer">
        <p>Built with TypeScript</p>
      </footer>
    </div>
  );
}

export default App;
