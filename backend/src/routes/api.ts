import { Router, Request, Response } from 'express';

const router = Router();

// Using SL Transport API types inline; old SL API response interfaces removed

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
    
    
      // Use SL Transport API for stop lookup and departures (no API key required)
      console.log(`Searching transport sites for: "${stopName}"`);
      const searchUrl = `https://transport.integration.sl.se/v1/sites?name=${encodeURIComponent(stopName)}`;
      console.log(`Fetching sites from: ${searchUrl}`);
      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        const body = await searchResponse.text().catch(() => '<unreadable>');
        console.error('SL transport sites API error', searchResponse.status, body);
        res.status(502).json({ error: 'SL API Error', message: 'Failed to search for stop', status: searchResponse.status });
        return;
      }

      const sites = (await searchResponse.json()) as Array<{ id: number; name: string; alias?: string[] }>;

      if (!sites || sites.length === 0) {
        console.warn('SL transport returned no matches', { stopName, sites });
        res.status(404).json({ error: 'Not Found', message: `Bus stop "${stopName}" not found.` });
        return;
      }

      // Prefer exact match or alias, otherwise take the first
      let site = sites.find(s => s.name.toLowerCase() === stopName.toLowerCase());
      if (!site) {
        site = sites.find(s => s.alias && s.alias.some(a => a.toLowerCase() === stopName.toLowerCase()));
      }
      if (!site) site = sites[0];

      const stopId = site.id;
      const finalStopName = site.name;
      console.log(`Using site: ${finalStopName} (ID: ${stopId})`);

      const departuresUrl = `https://transport.integration.sl.se/v1/sites/${stopId}/departures`;
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

    
      const departuresData = await departuresResponse.json() as any;
      console.log('Departures API response received', { keys: Object.keys(departuresData || {}) });

      // departuresData.departures is an array of departure objects
      const buses: Array<{ line: string; destination: string; departureTime: string }> = [];
      if (Array.isArray(departuresData.departures)) {
        buses.push(...departuresData.departures.map((d: any) => {
          const designation = d.line?.designation || d.line?.name || d.line || '';
          const mode = d.line?.transport_mode || d.line?.transport_mode || '';
          let lineLabel = designation;
          if (mode === 'METRO') lineLabel = `Metro ${designation}`;
          else if (mode === 'TRAIN') lineLabel = `Train ${designation}`;
          else if (mode === 'TRAM') lineLabel = `Tram ${designation}`;
          else if (mode === 'BUS') lineLabel = `${designation}`;

          return {
            line: lineLabel,
            destination: d.destination || d.direction || '',
            departureTime: d.expected || d.scheduled || d.display || ''
          };
        }));
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
