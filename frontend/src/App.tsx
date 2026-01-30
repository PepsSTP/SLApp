import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

interface Item {
  id: number;
  name: string;
  description: string;
}

interface Bus {
  line: string;
  destination: string;
  departureTime: string;
}

interface BusStopData {
  stopName: string;
  buses: Bus[];
}

function App() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  
  // Bus stop state
  const [busStopName, setBusStopName] = useState('')
  const [busData, setBusData] = useState<BusStopData | null>(null)
  const [busLoading, setBusLoading] = useState(false)
  const [busError, setBusError] = useState<string | null>(null)

  // Fetch items from API
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await axios.get<Item[]>('/api/items')
      setItems(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch items')
      console.error('Error fetching items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newItemName.trim()) {
      return
    }

    try {
      const response = await axios.post<Item>('/api/items', {
        name: newItemName,
        description: newItemDescription
      })
      
      setItems([...items, response.data])
      setNewItemName('')
      setNewItemDescription('')
    } catch (err) {
      setError('Failed to add item')
      console.error('Error adding item:', err)
    }
  }

  const handleDeleteItem = async (id: number) => {
    try {
      await axios.delete(`/api/items/${id}`)
      setItems(items.filter(item => item.id !== id))
    } catch (err) {
      setError('Failed to delete item')
      console.error('Error deleting item:', err)
    }
  }

  const handleSearchBusStop = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!busStopName.trim()) {
      setBusError('Please enter a bus stop name')
      return
    }

    try {
      setBusLoading(true)
      setBusError(null)
      const response = await axios.get<BusStopData>(`/api/buses/${encodeURIComponent(busStopName)}`)
      setBusData(response.data)
    } catch (err) {
      setBusError('Failed to fetch bus information. Please check the stop name and try again.')
      setBusData(null)
      console.error('Error fetching buses:', err)
    } finally {
      setBusLoading(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Stockholm Bus Tracker</h1>
        <p>Check real-time bus arrivals from SL (Stockholms Lokaltrafik)</p>
      </header>

      <main className="App-main">
        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        <section className="bus-section">
          <h2>🚌 Find Buses</h2>
          <form onSubmit={handleSearchBusStop} className="bus-form">
            <input
              type="text"
              placeholder="Enter bus stop name (e.g., Central Station)"
              value={busStopName}
              onChange={(e) => setBusStopName(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary" disabled={busLoading}>
              {busLoading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {busError && (
            <div className="error-message">
              {busError}
            </div>
          )}

          {busData && (
            <div className="bus-results">
              <h3>{busData.stopName}</h3>
              {busData.buses.length > 0 ? (
                <div className="buses-list">
                  {busData.buses.map((bus, index) => (
                    <div key={index} className="bus-card">
                      <div className="bus-line">{bus.line}</div>
                      <div className="bus-info">
                        <p className="bus-destination">{bus.destination}</p>
                        <p className="bus-time">{bus.departureTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-buses">No buses found for this stop</p>
              )}
            </div>
          )}
        </section>

        <section className="add-item-section">
          <h2>📝 Add New Item</h2>
          <form onSubmit={handleAddItem} className="add-item-form">
            <input
              type="text"
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="input-field"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newItemDescription}
              onChange={(e) => setNewItemDescription(e.target.value)}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary">
              Add Item
            </button>
          </form>
        </section>

        <section className="items-section">
          <div className="section-header">
            <h2>📋 Items List</h2>
            <button onClick={fetchItems} className="btn btn-secondary">
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>No items yet. Add one above!</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <div className="item-header">
                    <h3>{item.name}</h3>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="btn btn-danger btn-small"
                      aria-label="Delete item"
                    >
                      🗑️
                    </button>
                  </div>
                  <p className="item-description">
                    {item.description || 'No description'}
                  </p>
                  <span className="item-id">ID: {item.id}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="App-footer">
        <p>Built with ❤️ using TypeScript</p>
      </footer>
    </div>
  )
}

export default App
