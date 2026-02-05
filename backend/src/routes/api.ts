import { Router, Request, Response } from 'express';

const router = Router();

interface SearchResponse {
  ResponseData?: Array<{ SiteId: number; Name: string }>;
}

interface DeparturesResponse {
  ResponseData?: {
    Buses?: Array<{
      LineNumber: string;
      Destination: string;
      ExpectedDepartureTime?: string;
      ScheduledDepartureTime: string;
    }>;
    Metro?: Array<{
      LineNumber: string;
      Destination: string;
      ExpectedDepartureTime?: string;
      ScheduledDepartureTime: string;
    }>;
  };
}

// Get buses for a specific stop from SL API
router.get('/buses/:stopName', async (req: Request, res: Response): Promise<void> => {
  const stopName = decodeURIComponent(req.params.stopName);
  
  try {
    // Check if API key is configured
    if (!process.env.SL_API_KEY) {
      res.status(500).json({
        error: 'Configuration Error',
        message: 'SL_API_KEY is not configured'
      });
      return;
    }
    
    console.log(`Searching for bus stop: "${stopName}"`);
    
    // Try multiple search variations to handle case sensitivity and partial matches
    const searchVariations = [
      stopName,
      stopName.toLowerCase(),
      stopName.charAt(0).toUpperCase() + stopName.slice(1).toLowerCase(),
    ];
    
    let searchData: SearchResponse | null = null;
    let lastError: string | null = null;
    
    for (const searchTerm of searchVariations) {
      try {
        const searchUrl = `https://api.sl.se/api2/typeahead/searchStops/json?searchString=${encodeURIComponent(searchTerm)}&apikey=${process.env.SL_API_KEY}`;
        
        console.log(`Attempting search with term: "${searchTerm}"`);
        const searchResponse = await fetch(searchUrl);

        if (!searchResponse.ok) {
          const body = await searchResponse.text().catch(() => '<unreadable>');
          console.error(`SL search API error (${searchTerm})`, searchResponse.status, body);
          lastError = `API returned ${searchResponse.status}`;
          continue;
        }

        searchData = (await searchResponse.json()) as SearchResponse;
        
        // Check if we got results
        if (searchData.ResponseData && searchData.ResponseData.length > 0) {
          console.log(`Found ${searchData.ResponseData.length} matches for "${searchTerm}"`);
          break; // Success, exit the loop
        }
        
        console.log(`No results for search term: "${searchTerm}"`);
      } catch (error) {
        console.error(`Error during search variation "${searchTerm}":`, error);
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    if (!searchData || !searchData.ResponseData || searchData.ResponseData.length === 0) {
      console.warn('SL search returned no matches for any variation', { stopName, searchData });
      res.status(404).json({
        error: 'Not Found',
        message: `Bus stop "${stopName}" not found. Please check the spelling and try again.`,
        suggestions: 'Try searching with a partial name or the exact bus stop name from the SL website.'
      });
      return;
    }
    
    // Get the first stop match
    const stop = searchData.ResponseData![0];
    const stopId = stop.SiteId;
    const finalStopName = stop.Name;
    
    console.log(`Found bus stop: ${finalStopName} (ID: ${stopId})`);
    
    // Fetch departures for this stop
    const departuresUrl = `https://api.sl.se/api2/realtimedepartures/${stopId}/json?timewindow=30&apikey=${process.env.SL_API_KEY}`;
    
    console.log(`Fetching departures from: ${departuresUrl}`);
    const departuresResponse = await fetch(departuresUrl);

    if (!departuresResponse.ok) {
      const body = await departuresResponse.text().catch(() => '<unreadable>');
      console.error('SL departures API error', departuresResponse.status, body);
      res.status(502).json({
        error: 'SL API Error',
        message: `Failed to fetch departures for ${finalStopName}`,
        status: departuresResponse.status
      });
      return;
    }

    const departuresData = (await departuresResponse.json()) as DeparturesResponse;
    
    console.log('Departures API response received', {
      hasBuses: !!departuresData.ResponseData?.Buses,
      busCount: departuresData.ResponseData?.Buses?.length || 0,
      hasMetro: !!departuresData.ResponseData?.Metro,
      metroCount: departuresData.ResponseData?.Metro?.length || 0
    });
    
    // Format the response
    const buses: Array<{ line: string; destination: string; departureTime: string }> = [];
    
    // Add bus departures
    if (departuresData.ResponseData?.Buses) {
      buses.push(
        ...departuresData.ResponseData.Buses.map((bus) => ({
          line: bus.LineNumber,
          destination: bus.Destination,
          departureTime: bus.ExpectedDepartureTime || bus.ScheduledDepartureTime
        }))
      );
    }
    
    // Add metro/train departures if available
    if (departuresData.ResponseData?.Metro) {
      buses.push(
        ...departuresData.ResponseData.Metro.map((metro) => ({
          line: `Metro ${metro.LineNumber}`,
          destination: metro.Destination,
          departureTime: metro.ExpectedDepartureTime || metro.ScheduledDepartureTime
        }))
      );
    }
    
    // Sort by departure time
    buses.sort((a, b) => {
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });
    
    console.log(`Returning ${Math.min(buses.length, 5)} departures for ${finalStopName}`);
    
    // Return only the next 5 departures
    res.json({
      stopName: finalStopName,
      buses: buses.slice(0, 5)
    });
  } catch (error) {
    console.error('Error fetching from SL API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch bus information from SL API',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// Example: Get all items
router.get('/items', (_req: Request, res: Response) => {
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
router.post('/items', (req: Request, res: Response): void => {
  const { name, description } = req.body;
  
  if (!name) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Name is required'
    });
    return;
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
