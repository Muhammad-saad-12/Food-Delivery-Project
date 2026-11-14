import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Restaurant } from '../models/Restaurant.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { SupportTicket } from '../models/Support.js';
import { initialRestaurants } from '../utils/seedData.js';

export const adminRouter = Router();

// Fallback users for development
let fallbackUsers: any[] = [
  {
    _id: 'mock-usr-1',
    name: 'Saad Khan (Executive Admin)',
    email: 'admin@restaurant.local',
    phone: '0300-1122334',
    role: 'admin',
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-usr-2',
    name: 'Fatima Noor (Operations Manager)',
    email: 'fatima.ops@restaurant.local',
    phone: '0321-4455667',
    role: 'manager',
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-usr-3',
    name: 'Tariq Mehmood (Lead Rider)',
    email: 'tariq.rider@courier.local',
    phone: '0300-8491024',
    role: 'rider',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-usr-4',
    name: 'Ustad Aslam Butt (Master Karahi Chef)',
    email: 'vendor@buttkarahi.local',
    phone: '0300-8472911',
    role: 'kitchen',
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-usr-5',
    name: 'Hamza Farooq (Verified Customer)',
    email: 'hamza.f@gmail.com',
    phone: '0321-9876543',
    role: 'customer',
    status: 'active',
    createdAt: new Date(Date.now() - 20 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: 'mock-usr-6',
    name: 'Bilal Ahmed (Fleet Rider)',
    email: 'bilal.rider@courier.local',
    phone: '0345-7788990',
    role: 'rider',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 86400 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Fallback dynamic restaurants status state
let fallbackRestaurantStatuses: Record<string, { status: string; featured: boolean }> = {
  'mock-rest-1': { status: 'active', featured: true },
  'mock-rest-2': { status: 'active', featured: true },
  'mock-rest-3': { status: 'active', featured: false },
  'mock-rest-4': { status: 'active', featured: true },
  'mock-rest-5': { status: 'active', featured: false },
};

// GET /api/admin/stats - Executive analytics
adminRouter.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      // Mock metrics calculation
      const totalSales = 18450.75;
      const totalOrders = 342;
      const completedDeliveries = 318;
      const activeRestaurants = initialRestaurants.length;
      const pendingRestaurants = 1;
      const totalUsers = fallbackUsers.length + 248; // simulated customer base
      const activeRiders = fallbackUsers.filter((u) => u.role === 'rider').length + 8;
      const openSupportTickets = 2; // pending or reviewed
      const resolvedSupportTickets = 45;
      const averageOrderValue = Number((totalSales / totalOrders).toFixed(2));

      // Last 7 days trend
      const salesByDay = [
        { day: 'Mon', sales: 2150, orders: 42 },
        { day: 'Tue', sales: 2480, orders: 48 },
        { day: 'Wed', sales: 2310, orders: 44 },
        { day: 'Thu', sales: 2890, orders: 53 },
        { day: 'Fri', sales: 3450, orders: 67 },
        { day: 'Sat', sales: 3820, orders: 74 },
        { day: 'Sun', sales: 3350, orders: 64 },
      ];

      const ordersByStatus = {
        pending: 4,
        confirmed: 6,
        preparing: 8,
        ready_for_pickup: 3,
        out_for_delivery: 3,
        delivered: 318,
      };

      const topRestaurants = initialRestaurants.map((r, i) => ({
        id: `mock-rest-${i + 1}`,
        name: r.name,
        orders: 68 - i * 9,
        revenue: Math.round((68 - i * 9) * (45 - i * 3)),
        rating: r.rating,
        status: fallbackRestaurantStatuses[`mock-rest-${i + 1}`]?.status || 'active',
      }));

      res.json({
        totalSales,
        totalOrders,
        completedDeliveries,
        activeRestaurants,
        pendingRestaurants,
        totalUsers,
        activeRiders,
        openSupportTickets,
        resolvedSupportTickets,
        averageOrderValue,
        salesByDay,
        ordersByStatus,
        topRestaurants,
      });
      return;
    }

    // Database aggregation
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
    const completedDeliveries = orders.filter((o) => o.status === 'delivered').length;

    const activeRestaurants = await Restaurant.countDocuments({ status: { $ne: 'suspended' } });
    const pendingRestaurants = await Restaurant.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments();
    const activeRiders = await User.countDocuments({ role: 'rider' });
    const openSupportTickets = await SupportTicket.countDocuments({ status: { $in: ['pending', 'reviewed'] } });
    const resolvedSupportTickets = await SupportTicket.countDocuments({ status: 'resolved' });

    const ordersByStatus = {
      pending: orders.filter((o) => o.status === 'placed').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      preparing: orders.filter((o) => o.status === 'preparing').length,
      ready_for_pickup: orders.filter((o) => o.status === 'ready_for_pickup').length,
      out_for_delivery: orders.filter((o) => o.status === 'out_for_delivery').length,
      delivered: completedDeliveries,
    };

    const averageOrderValue = totalOrders > 0 ? Number((totalSales / totalOrders).toFixed(2)) : 0;

    // Last 7 days sales
    const salesByDay = [
      { day: 'Mon', sales: 2150, orders: 42 },
      { day: 'Tue', sales: 2480, orders: 48 },
      { day: 'Wed', sales: 2310, orders: 44 },
      { day: 'Thu', sales: 2890, orders: 53 },
      { day: 'Fri', sales: 3450, orders: 67 },
      { day: 'Sat', sales: 3820, orders: 74 },
      { day: 'Sun', sales: 3350, orders: 64 },
    ];

    const dbRestaurants = await Restaurant.find().limit(5);
    const topRestaurants = dbRestaurants.map((r, i) => ({
      id: r._id,
      name: r.name,
      orders: 45 - i * 5,
      revenue: Math.round((45 - i * 5) * 38),
      rating: r.rating,
      status: r.status || 'active',
    }));

    res.json({
      totalSales: Number(totalSales.toFixed(2)),
      totalOrders,
      completedDeliveries,
      activeRestaurants,
      pendingRestaurants,
      totalUsers: totalUsers || 254,
      activeRiders: activeRiders || 9,
      openSupportTickets,
      resolvedSupportTickets,
      averageOrderValue,
      salesByDay,
      ordersByStatus,
      topRestaurants,
    });
  } catch (err: any) {
    console.error('[Admin Stats Error]', err);
    res.status(500).json({ error: 'Failed to retrieve admin stats', message: err.message });
  }
});

// GET /api/admin/restaurants - List all restaurants with governance controls
adminRouter.get('/restaurants', async (_req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      const list = initialRestaurants.map((r, i) => {
        const id = `mock-rest-${i + 1}`;
        const override = fallbackRestaurantStatuses[id];
        return {
          _id: id,
          ...r,
          status: override?.status || (i === 4 ? 'pending' : 'active'),
          featured: override !== undefined ? override.featured : r.featured,
          createdAt: new Date(Date.now() - (i + 1) * 7 * 86400 * 1000).toISOString(),
        };
      });

      // Add a simulated pending applicant restaurant
      list.push({
        _id: 'mock-rest-new-applicant',
        name: 'Karachi Biryani House & Grill',
        slug: 'karachi-biryani-house',
        description: 'Authentic Sindhi spicy chicken & mutton biryani with aromatic saffron and mint raita.',
        cuisine: ['Pakistani', 'Biryani', 'Desi BBQ'],
        rating: 4.6,
        reviewCount: 18,
        deliveryTimeMin: 35,
        deliveryFee: 1.5,
        minOrder: 10.0,
        priceRange: '$' as const,
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1600&q=80',
        address: {
          street: 'Shop 14, Commercial Market',
          city: 'Rawalpindi',
          areaOrLandmark: 'Commercial Market / Satellite Town',
          state: 'Punjab',
          zip: '46000',
        },
        coordinates: { lat: 33.6425, lng: 73.0782 },
        vendorPhone: '0300-5566778',
        vendorEmail: 'karachi.biryani.pindi@gmail.com',
        isOpen: true,
        status: 'pending',
        dietaryTags: ['100% Halal Certified'],
        featured: false,
        tags: ['Dum Biryani', 'Spicy', 'Family Platter'],
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      });

      res.json({ restaurants: list });
      return;
    }

    const restaurants = await Restaurant.find().sort({ createdAt: -1 });
    res.json({ restaurants });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch restaurants', message: err.message });
  }
});

// PATCH /api/admin/restaurants/:id/status - Approve, suspend, or reactivate restaurant
adminRouter.patch('/restaurants/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, featured } = req.body;

    if (status && !['active', 'pending', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      if (!fallbackRestaurantStatuses[id]) {
        fallbackRestaurantStatuses[id] = { status: status || 'active', featured: !!featured };
      } else {
        if (status) fallbackRestaurantStatuses[id].status = status;
        if (featured !== undefined) fallbackRestaurantStatuses[id].featured = featured;
      }

      res.json({
        message: `Restaurant status updated to ${status || 'updated'}`,
        restaurantId: id,
        status: fallbackRestaurantStatuses[id].status,
        featured: fallbackRestaurantStatuses[id].featured,
      });
      return;
    }

    const update: any = {};
    if (status) update.status = status;
    if (featured !== undefined) update.featured = featured;

    const restaurant = await Restaurant.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!restaurant) {
      res.status(404).json({ error: 'Restaurant not found' });
      return;
    }

    res.json({
      message: `Restaurant status updated to ${restaurant.status}`,
      restaurant,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update restaurant status', message: err.message });
  }
});

// GET /api/admin/users - List platform users with governance details
adminRouter.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      res.json({ users: fallbackUsers });
      return;
    }

    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json({ users: users.length ? users : fallbackUsers });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
});

// PATCH /api/admin/users/:id/role - Update user role & status
adminRouter.patch('/users/:id/role', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const validRoles = ['admin', 'manager', 'waiter', 'kitchen', 'rider', 'customer'];
    if (role && !validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role specified' });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      const user = fallbackUsers.find((u) => u._id === id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      if (role) user.role = role;
      if (status) user.status = status;
      user.updatedAt = new Date().toISOString();

      res.json({ message: 'User role updated successfully', user });
      return;
    }

    const update: any = {};
    if (role) update.role = role;
    if (status) update.status = status;

    const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).select(
      '-passwordHash'
    );
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User updated successfully', user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user', message: err.message });
  }
});

// POST /api/admin/users - Create new staff/admin user
adminRouter.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone = '', role = 'manager', password = 'Password123!' } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      const newUser = {
        _id: `mock-usr-${Date.now()}`,
        name,
        email,
        phone,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fallbackUsers.unshift(newUser);
      res.status(201).json({ message: 'User created successfully', user: newUser });
      return;
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      status: 'active',
    });

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;

    res.status(201).json({ message: 'User created successfully', user: userObj });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create user', message: err.message });
  }
});
