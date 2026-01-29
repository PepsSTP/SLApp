import { Router, Request, Response } from 'express';

const router = Router();

// Get buses for a specific stop from SL API
router.get('/buses/:stopName', async (req: Request, res: Response) => {
  const stopName = decodeURIComponent(req.params.stopName);
  
  try {
    // First, search for the stop to get its ID
    const searchUrl = `https://api.sl.se/api2/typeahead/searchStops/json?searchString=${encodeURIComponent(stopName)}&apikey=${process.env.SL_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.ResponseData || searchData.ResponseData.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Bus stop "${stopName}" not found`
      });
    }
    
    // Get the first stop match
    const stop = searchData.ResponseData[0];
    const stopId = stop.SiteId;
    const finalStopName = stop.Name;
    
    // Fetch departures for this stop
    const departuresUrl = `https://api.sl.se/api2/realtimedepartures/${stopId}/json?timewindow=30&apikey=${process.env.SL_API_KEY}`;
    
    const departuresResponse = await fetch(departuresUrl);
    const departuresData = await departuresResponse.json();
    
    // Format the response
    const buses = [];
    
    // Add bus departures
    if (departuresData.ResponseData && departuresData.ResponseData.Buses) {
      buses.push(...departuresData.ResponseData.Buses.map((bus: any) => ({
        line: bus.LineNumber,
        destination: bus.Destination,
        departureTime: bus.ExpectedDepartureTime || bus.ScheduledDepartureTime
      })));
    }
    
    // Add metro/train departures if available
    if (departuresData.ResponseData && departuresData.ResponseData.Metro) {
      buses.push(...departuresData.ResponseData.Metro.map((metro: any) => ({
        line: `Metro ${metro.LineNumber}`,
        destination: metro.Destination,
        departureTime: metro.ExpectedDepartureTime || metro.ScheduledDepartureTime
      })));
    }
    
    // Sort by departure time
    buses.sort((a: any, b: any) => {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });
    
    // Return only the next 5 departures
    res.json({
      stopName: finalStopName,
      buses: buses.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching from SL API:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch bus information from SL API'
    });
  }
});

// Example: Get all items
router.get('/items', (req: Request, res: Response) => {
  const items = [
    { id: 1, name: 'Item 1', description: 'First example item' },
    { id: 2, name: 'Item 2', description: 'Second example item' },
    { id: 3, name: 'Item 3', description: 'Third example item' }
  ];
  
  res.json(items);
});

// Example: Get item by ID
router.get('/items/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Mock data - replace with database query
  const item = {
    id,
    name: `Item ${id}`,
    description: `Description for item ${id}`
  };
  
  res.json(item);
});

// Example: Create new item
router.post('/items', (req: Request, res: Response) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Name is required'
    });
  }
  
  // Mock response - replace with database insert
  const newItem = {
    id: Math.floor(Math.random() * 1000),
    name,
    description: description || '',
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json(newItem);
});

// Example: Update item
router.put('/items/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;
  
  // Mock response - replace with database update
  const updatedItem = {
    id,
    name: name || `Item ${id}`,
    description: description || `Description for item ${id}`,
    updatedAt: new Date().toISOString()
  };
  
  res.json(updatedItem);
});

// Example: Delete item
router.delete('/items/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  // Mock response - replace with database delete
  res.json({
    message: 'Item deleted successfully',
    id
  });
});

export default router;
