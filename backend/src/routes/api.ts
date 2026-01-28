import { Router, Request, Response } from 'express';

const router = Router();

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
