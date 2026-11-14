import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Restaurant } from '../models/Restaurant.js';

export const reviewRouter = Router();

// In-memory fallback dataset for development/testing
const inMemoryReviews: any[] = [
  {
    _id: 'rev-seed-1',
    restaurantId: 'mock-rest-1',
    dishName: 'Truffle & Burrata Margherita',
    customerName: 'Hamza Tariq',
    customerEmail: 'hamza@example.com',
    rating: 5,
    spiceRating: 4,
    comment:
      'The crust was wood-fired to absolute perfection and the truffle aroma was incredible! Best Neapolitan pizza in town.',
    tags: ['Authentic Flavor', 'Hot & Fresh', 'Generous Portions'],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    _id: 'rev-seed-2',
    restaurantId: 'mock-rest-2',
    dishName: 'Black Garlic Tonkotsu Ramen',
    customerName: 'Ayesha Khan',
    customerEmail: 'ayesha@example.com',
    rating: 5,
    spiceRating: 5,
    comment:
      'Requested Level 2 Tokyo Fire spice and it was exact! The chashu melted in the mouth and the broth was rich and velvety.',
    tags: ['Super Spicy', 'Authentic Flavor'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// POST /api/reviews - Submit a new rating & review
reviewRouter.post(
  '/',
  [
    body('restaurantId').notEmpty().withMessage('restaurantId is required'),
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerEmail')
      .trim()
      .isEmail()
      .withMessage('Valid customer email is required'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be an integer between 1 and 5 stars'),
    body('spiceRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Spice rating must be between 1 and 5'),
    body('comment')
      .trim()
      .isLength({ min: 3, max: 1000 })
      .withMessage('Comment must be between 3 and 1000 characters'),
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
        const newRev = {
          _id: `mem-rev-${Date.now()}`,
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        inMemoryReviews.unshift(newRev);
        res.status(201).json({ message: 'Review submitted successfully', review: newRev });
        return;
      }

      const review = new Review(req.body);
      const savedReview = await review.save();

      // Recalculate average rating for restaurant if valid ObjectId
      if (mongoose.isValidObjectId(req.body.restaurantId)) {
        const stats = await Review.aggregate([
          { $match: { restaurantId: new mongoose.Types.ObjectId(req.body.restaurantId) } },
          {
            $group: {
              _id: '$restaurantId',
              avgRating: { $avg: '$rating' },
              count: { $sum: 1 },
            },
          },
        ]);

        if (stats.length > 0) {
          await Restaurant.findByIdAndUpdate(req.body.restaurantId, {
            rating: Number(stats[0].avgRating.toFixed(1)),
            reviewCount: stats[0].count,
          });
        }
      }

      res.status(201).json({
        message: 'Review submitted successfully',
        review: savedReview,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  }
);

// GET /api/reviews - Get reviews with summary metrics
reviewRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { restaurantId, menuItemId } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      let list = [...inMemoryReviews];
      if (restaurantId) {
        list = list.filter((r) => String(r.restaurantId) === String(restaurantId));
      }
      if (menuItemId) {
        list = list.filter((r) => String(r.menuItemId) === String(menuItemId));
      }

      const total = list.length;
      const avg =
        total > 0
          ? Number((list.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
          : 5.0;

      res.status(200).json({
        total,
        averageRating: avg,
        reviews: list,
        source: 'local-memory',
      });
      return;
    }

    const filter: Record<string, any> = {};
    if (restaurantId) {
      filter.restaurantId = restaurantId;
    }
    if (menuItemId) {
      filter.menuItemId = menuItemId;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    const total = reviews.length;
    const avg =
      total > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
        : 5.0;

    res.status(200).json({
      total,
      averageRating: avg,
      reviews,
      source: 'database',
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});
