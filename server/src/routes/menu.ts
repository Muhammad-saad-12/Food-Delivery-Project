import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { MenuItem } from '../models/MenuItem.js';
import { initialRestaurants, getMenuItemsForRestaurant } from '../utils/seedData.js';

export const menuRouter = Router();

// In-memory fallback lookup
const getAllFallbackMenuItems = () => {
  return initialRestaurants.flatMap((r, i) =>
    getMenuItemsForRestaurant(`mock-rest-${i + 1}`, r.slug).map((m, idx) => ({
      ...m,
      _id: `mock-item-${i + 1}-${idx + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );
};

// GET /api/menu - List all menu items with filtering
menuRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, category, popular, search, dietary } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      let items = getAllFallbackMenuItems();

      if (restaurantId) {
        items = items.filter((item) => String(item.restaurantId) === String(restaurantId));
      }
      if (category && category !== 'all') {
        items = items.filter((item) => item.category.toLowerCase() === String(category).toLowerCase());
      }
      if (popular === 'true') {
        items = items.filter((item) => item.popular);
      }
      if (dietary && dietary !== 'all') {
        const d = String(dietary).toLowerCase();
        items = items.filter((item) => item.dietaryTags.some((t) => t.toLowerCase().includes(d)));
      }
      if (search) {
        const q = String(search).toLowerCase();
        items = items.filter(
          (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
        );
      }

      res.status(200).json({ count: items.length, items, source: 'local-fallback' });
      return;
    }

    const filter: Record<string, any> = {};
    if (restaurantId && mongoose.isValidObjectId(restaurantId)) {
      filter.restaurantId = restaurantId;
    }
    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }
    if (popular === 'true') {
      filter.popular = true;
    }
    if (dietary && dietary !== 'all') {
      filter.dietaryTags = { $in: [new RegExp(String(dietary), 'i')] };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } },
      ];
    }

    const items = await MenuItem.find(filter).populate('restaurantId', 'name slug');
    res.status(200).json({ count: items.length, items, source: 'database' });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// GET /api/menu/:id - Get single item with all customization options
menuRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected || !mongoose.isValidObjectId(id)) {
      const allItems = getAllFallbackMenuItems();
      const item = allItems.find((i) => i._id === id) || allItems[0];
      res.status(200).json({ item, source: 'local-fallback' });
      return;
    }

    const item = await MenuItem.findById(id).populate('restaurantId', 'name deliveryFee minOrder');
    if (!item) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.status(200).json({ item, source: 'database' });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// POST /api/menu - Create menu item
menuRouter.post(
  '/',
  [
    body('restaurantId').notEmpty().withMessage('restaurantId is required'),
    body('name').trim().notEmpty().withMessage('Item name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const isConnected = mongoose.connection.readyState === 1;
      if (!isConnected) {
        const newItem = {
          _id: `mock-item-${Date.now()}`,
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        res.status(201).json({ message: 'Menu item created (in-memory)', item: newItem });
        return;
      }

      const item = new MenuItem(req.body);
      await item.save();
      res.status(201).json({ message: 'Menu item created', item });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: 'Failed to create menu item' });
    }
  }
);

// PUT /api/menu/:id - Update menu item
menuRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected || !mongoose.isValidObjectId(id)) {
      res.status(200).json({
        message: 'Menu item updated (mock)',
        item: { _id: id, ...req.body },
      });
      return;
    }

    const updated = await MenuItem.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.status(200).json({ message: 'Menu item updated', item: updated });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE /api/menu/:id - Delete menu item
menuRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected || !mongoose.isValidObjectId(id)) {
      res.status(200).json({ message: 'Menu item deleted (mock)' });
      return;
    }

    const deleted = await MenuItem.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});
