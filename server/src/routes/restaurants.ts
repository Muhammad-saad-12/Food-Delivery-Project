import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Restaurant } from '../models/Restaurant.js';
import { MenuItem } from '../models/MenuItem.js';
import { initialRestaurants, getMenuItemsForRestaurant } from '../utils/seedData.js';

export const restaurantRouter = Router();

// In-memory fallback dataset for offline/database-less development
const getFallbackRestaurants = () => {
  return initialRestaurants.map((r, index) => ({
    ...r,
    _id: `mock-rest-${index + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

const getFallbackMenu = (restaurantId: string, slug?: string) => {
  const rest = initialRestaurants.find(
    (r, i) => `mock-rest-${i + 1}` === restaurantId || r.slug === slug
  ) || initialRestaurants[0];
  return getMenuItemsForRestaurant(restaurantId, rest.slug).map((m, idx) => ({
    ...m,
    _id: `mock-item-${restaurantId}-${idx + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// GET /api/restaurants - List restaurants with filtering and search
restaurantRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      cuisine,
      dietary,
      priceRange,
      minRating,
      sort = 'rating',
      featured,
    } = req.query;

    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      // Return filtered fallback data
      let list = getFallbackRestaurants();

      if (search) {
        const query = String(search).toLowerCase();
        list = list.filter(
          (r) =>
            r.name.toLowerCase().includes(query) ||
            r.description.toLowerCase().includes(query) ||
            r.cuisine.some((c) => c.toLowerCase().includes(query)) ||
            r.tags.some((t) => t.toLowerCase().includes(query))
        );
      }

      if (cuisine && cuisine !== 'all') {
        const cLower = String(cuisine).toLowerCase();
        list = list.filter((r) =>
          r.cuisine.some((c) => c.toLowerCase() === cLower)
        );
      }

      if (dietary && dietary !== 'all') {
        const dLower = String(dietary).toLowerCase();
        list = list.filter((r) =>
          r.dietaryTags.some((d) => d.toLowerCase().includes(dLower))
        );
      }

      if (priceRange) {
        list = list.filter((r) => r.priceRange === priceRange);
      }

      if (minRating) {
        const min = Number(minRating);
        list = list.filter((r) => r.rating >= min);
      }

      if (featured === 'true') {
        list = list.filter((r) => r.featured);
      }

      // Sort
      if (sort === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      } else if (sort === 'deliveryTime') {
        list.sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin);
      } else if (sort === 'deliveryFee') {
        list.sort((a, b) => a.deliveryFee - b.deliveryFee);
      }

      res.status(200).json({
        total: list.length,
        restaurants: list,
        source: 'local-fallback',
      });
      return;
    }

    // Database query
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } },
        { cuisine: { $in: [new RegExp(String(search), 'i')] } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    if (cuisine && cuisine !== 'all') {
      filter.cuisine = { $in: [new RegExp(`^${cuisine}$`, 'i')] };
    }

    if (dietary && dietary !== 'all') {
      filter.dietaryTags = { $in: [new RegExp(String(dietary), 'i')] };
    }

    if (priceRange) {
      filter.priceRange = priceRange;
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    const sortOption: Record<string, 1 | -1> = {};
    if (sort === 'rating') sortOption.rating = -1;
    else if (sort === 'deliveryTime') sortOption.deliveryTimeMin = 1;
    else if (sort === 'deliveryFee') sortOption.deliveryFee = 1;
    else sortOption.createdAt = -1;

    const restaurants = await Restaurant.find(filter).sort(sortOption);

    res.status(200).json({
      total: restaurants.length,
      restaurants,
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// GET /api/restaurants/:id - Get restaurant details with menu categorized
restaurantRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected || !mongoose.isValidObjectId(id)) {
      const fallbackList = getFallbackRestaurants();
      const restaurant =
        fallbackList.find((r) => r._id === id || r.slug === id) ||
        fallbackList[0];
      const menuItems = getFallbackMenu(restaurant._id, restaurant.slug);

      // Group menu items by category
      const categories = Array.from(new Set(menuItems.map((m) => m.category)));
      const menuByCategory = categories.map((cat) => ({
        category: cat,
        items: menuItems.filter((m) => m.category === cat),
      }));

      res.status(200).json({
        restaurant,
        categories,
        menuByCategory,
        menuItems,
        source: 'local-fallback',
      });
      return;
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    const menuItems = await MenuItem.find({ restaurantId: id });
    const categories = Array.from(new Set(menuItems.map((m) => m.category)));
    const menuByCategory = categories.map((cat) => ({
      category: cat,
      items: menuItems.filter((m) => m.category === cat),
    }));

    res.status(200).json({
      restaurant,
      categories,
      menuByCategory,
      menuItems,
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    res.status(500).json({ error: 'Failed to fetch restaurant details' });
  }
});

// POST /api/restaurants - Create new restaurant
restaurantRouter.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Restaurant name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('cuisine').isArray({ min: 1 }).withMessage('At least one cuisine is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const slug =
        req.body.slug ||
        req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newRest = new Restaurant({
        ...req.body,
        slug,
      });

      await newRest.save();
      res.status(201).json({ message: 'Restaurant created', restaurant: newRest });
    } catch (error) {
      console.error('Error creating restaurant:', error);
      res.status(500).json({ error: 'Failed to create restaurant' });
    }
  }
);
