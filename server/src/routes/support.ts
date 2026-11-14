import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { SupportTicket, ISupportTicket } from '../models/Support.js';
import { getIO } from '../config/socket.js';

export const supportRouter = Router();

// Fallback in-memory tickets for development or testing
let fallbackTickets: any[] = [
  {
    _id: 'mock-tkt-1',
    ticketId: 'TKT-8401',
    name: 'Hamza Farooq',
    email: 'hamza.f@gmail.com',
    phone: '0321-9876543',
    userType: 'customer',
    category: 'delivery_delay',
    priority: 'high',
    status: 'pending',
    orderNumber: 'ORD-7291',
    restaurantName: 'Butt Karahi & BBQ',
    subject: 'Rider delayed past 45 mins in Lakshmi Chowk traffic',
    message: 'My Mutton Shinwari Karahi was scheduled for 8:30 PM. The rider was stuck near McLeod Road, order is 40 minutes late.',
    adminNotes: 'Contacted rider dispatch Tariq to expedite delivery via alternate route.',
    resolution: '',
    assignedTo: 'Admin Fatima',
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    _id: 'mock-tkt-2',
    ticketId: 'TKT-8402',
    name: 'Ustad Aslam Butt',
    email: 'vendor@buttkarahi.local',
    phone: '0300-8472911',
    userType: 'vendor',
    category: 'restaurant_inquiry',
    priority: 'medium',
    status: 'reviewed',
    orderNumber: '',
    restaurantName: 'Butt Karahi & BBQ',
    subject: 'Requesting POS integration for weekend rush hours',
    message: 'We are experiencing high order volumes on Friday nights and would like to sync our kitchen display with an automated thermal receipt printer webhook.',
    adminNotes: 'Forwarded specs for automated webhook receipt printing to tech team.',
    resolution: 'Technical documentation and API webhook endpoints shared with vendor.',
    assignedTo: 'Admin Saad',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'mock-tkt-3',
    ticketId: 'TKT-8403',
    name: 'Tariq Mehmood',
    email: 'tariq.rider@courier.local',
    phone: '0300-8491024',
    userType: 'rider',
    category: 'payment_refund',
    priority: 'urgent',
    status: 'pending',
    orderNumber: 'ORD-5192',
    restaurantName: 'Kolachi Restaurant',
    subject: 'COD Cash Collection Discrepancy on Order ORD-5192',
    message: 'Customer paid PKR 3,500 in cash but customer invoice showed Rs. 3,250 due to a coupon code. Need adjustment in daily rider float account.',
    adminNotes: 'Auditing ledger transaction against JazzCash float.',
    resolution: '',
    assignedTo: '',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  },
  {
    _id: 'mock-tkt-4',
    ticketId: 'TKT-8404',
    name: 'Ayesha Siddiqui',
    email: 'ayesha.s@outlook.com',
    phone: '0333-5511223',
    userType: 'customer',
    category: 'food_quality',
    priority: 'medium',
    status: 'resolved',
    orderNumber: 'ORD-3190',
    restaurantName: 'Haveli Restaurant',
    subject: 'Missing extra Roghni Naan and Zeera Raita',
    message: 'Received the Royal Nihari with Bone Marrow but the extra Roghni Naan portions were missing from the delivery bag.',
    adminNotes: 'Issued automated promo voucher for PKR 400 on customer wallet.',
    resolution: 'Apologized to customer and credited 400 PKR wallet credit.',
    assignedTo: 'Admin Fatima',
    resolvedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
];

// GET /api/support - List support tickets with filtering
supportRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, category, priority, userType, search } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      let filtered = [...fallbackTickets];

      if (status && status !== 'all') {
        filtered = filtered.filter((t) => t.status === status);
      }
      if (category && category !== 'all') {
        filtered = filtered.filter((t) => t.category === category);
      }
      if (priority && priority !== 'all') {
        filtered = filtered.filter((t) => t.priority === priority);
      }
      if (userType && userType !== 'all') {
        filtered = filtered.filter((t) => t.userType === userType);
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.ticketId.toLowerCase().includes(q) ||
            t.name.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q) ||
            (t.orderNumber && t.orderNumber.toLowerCase().includes(q))
        );
      }

      // Sort newest first
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const pendingCount = fallbackTickets.filter((t) => t.status === 'pending').length;
      const reviewedCount = fallbackTickets.filter((t) => t.status === 'reviewed').length;
      const resolvedCount = fallbackTickets.filter((t) => t.status === 'resolved').length;

      res.json({
        tickets: filtered,
        total: filtered.length,
        pendingCount,
        reviewedCount,
        resolvedCount,
      });
      return;
    }

    const query: any = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;
    if (userType && userType !== 'all') query.userType = userType;
    if (search) {
      const q = String(search);
      query.$or = [
        { ticketId: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { orderNumber: { $regex: q, $options: 'i' } },
      ];
    }

    const tickets = await SupportTicket.find(query).sort({ createdAt: -1 });
    const pendingCount = await SupportTicket.countDocuments({ status: 'pending' });
    const reviewedCount = await SupportTicket.countDocuments({ status: 'reviewed' });
    const resolvedCount = await SupportTicket.countDocuments({ status: 'resolved' });

    res.json({
      tickets,
      total: tickets.length,
      pendingCount,
      reviewedCount,
      resolvedCount,
    });
  } catch (err: any) {
    console.error('[Support Route Error]', err);
    res.status(500).json({ error: 'Failed to fetch support tickets', message: err.message });
  }
});

// POST /api/support - Submit inquiry or complaint
supportRouter.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const {
        name,
        email,
        phone = '',
        userType = 'customer',
        category = 'general',
        priority = 'medium',
        orderNumber = '',
        restaurantName = '',
        subject,
        message,
      } = req.body;

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `TKT-${randomSuffix}`;

      const isConnected = mongoose.connection.readyState === 1;

      let newTicket: any;

      if (!isConnected) {
        newTicket = {
          _id: `mock-tkt-${Date.now()}`,
          ticketId,
          name,
          email,
          phone,
          userType,
          category,
          priority,
          status: 'pending',
          orderNumber,
          restaurantName,
          subject,
          message,
          adminNotes: '',
          resolution: '',
          assignedTo: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        fallbackTickets.unshift(newTicket);
      } else {
        newTicket = await SupportTicket.create({
          ticketId,
          name,
          email,
          phone,
          userType,
          category,
          priority,
          status: 'pending',
          orderNumber,
          restaurantName,
          subject,
          message,
        });
      }

      // Broadcast new ticket alert to admin room via Socket.IO
      try {
        const io = getIO();
        io.to('admin').emit('new_support_ticket', newTicket);
      } catch {
        // Socket broadcast optional
      }

      res.status(201).json({
        message: 'Support ticket submitted successfully',
        ticket: newTicket,
      });
    } catch (err: any) {
      console.error('[Support Submit Error]', err);
      res.status(500).json({ error: 'Failed to submit support ticket', message: err.message });
    }
  }
);

// GET /api/support/:id - Get single ticket details
supportRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    let ticket: any;
    if (!isConnected) {
      ticket = fallbackTickets.find((t) => t._id === id || t.ticketId === id);
    } else {
      ticket = await SupportTicket.findOne({
        $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { ticketId: id }],
      });
    }

    if (!ticket) {
      res.status(404).json({ error: 'Support ticket not found' });
      return;
    }

    res.json({ ticket });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch ticket details', message: err.message });
  }
});

// PATCH /api/support/:id - Update ticket status, admin notes, resolution, assignment
supportRouter.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, adminNotes, resolution, assignedTo, priority } = req.body;
    const isConnected = mongoose.connection.readyState === 1;

    let updatedTicket: any;

    if (!isConnected) {
      const idx = fallbackTickets.findIndex((t) => t._id === id || t.ticketId === id);
      if (idx === -1) {
        res.status(404).json({ error: 'Support ticket not found' });
        return;
      }

      if (status) fallbackTickets[idx].status = status;
      if (adminNotes !== undefined) fallbackTickets[idx].adminNotes = adminNotes;
      if (resolution !== undefined) fallbackTickets[idx].resolution = resolution;
      if (assignedTo !== undefined) fallbackTickets[idx].assignedTo = assignedTo;
      if (priority !== undefined) fallbackTickets[idx].priority = priority;
      if (status === 'resolved' && !fallbackTickets[idx].resolvedAt) {
        fallbackTickets[idx].resolvedAt = new Date().toISOString();
      }
      fallbackTickets[idx].updatedAt = new Date().toISOString();

      updatedTicket = fallbackTickets[idx];
    } else {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (resolution !== undefined) updateData.resolution = resolution;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (priority !== undefined) updateData.priority = priority;
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }

      updatedTicket = await SupportTicket.findOneAndUpdate(
        { $or: [{ _id: mongoose.isValidObjectId(id) ? id : null }, { ticketId: id }] },
        { $set: updateData },
        { new: true }
      );

      if (!updatedTicket) {
        res.status(404).json({ error: 'Support ticket not found' });
        return;
      }
    }

    // Broadcast update via Socket.IO
    try {
      const io = getIO();
      io.to('admin').emit('support_ticket_updated', updatedTicket);
    } catch {
      // Socket broadcast optional
    }

    res.json({
      message: 'Support ticket updated successfully',
      ticket: updatedTicket,
    });
  } catch (err: any) {
    console.error('[Support Update Error]', err);
    res.status(500).json({ error: 'Failed to update support ticket', message: err.message });
  }
});
