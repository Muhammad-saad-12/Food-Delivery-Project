import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Order, IOrder } from '../models/Order.js';
import { getIO } from '../config/socket.js';

export const orderRouter = Router();

// In-memory fallback cache for development/database-less operation
const inMemoryOrders: any[] = [];

// Helper to generate readable Pakistani order numbers
const generateOrderNumber = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `PK-${year}-${randomSuffix}`;
};

// POST /api/orders - Create & place a localized order
orderRouter.post(
  '/',
  [
    body('restaurantId').notEmpty().withMessage('restaurantId is required'),
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('customerPhone')
      .trim()
      .notEmpty()
      .withMessage('Valid Pakistani mobile phone is required'),
    body('deliveryAddress.street').notEmpty().withMessage('Street delivery address is required'),
    body('deliveryAddress.areaOrLandmark').notEmpty().withMessage('Landmark or area is required'),
    body('payment.method')
      .isIn(['cod', 'jazzcash', 'easypaisa'])
      .withMessage('Payment method must be cod, jazzcash, or easypaisa'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required in order'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const orderNumber = generateOrderNumber();
      const isConnected = mongoose.connection.readyState === 1;

      const orderData = {
        ...req.body,
        orderNumber,
        status: 'placed',
        timeline: [
          {
            status: 'placed',
            timestamp: new Date(),
            note:
              req.body.payment.method === 'cod'
                ? 'Order placed with Cash on Delivery (COD). Awaiting kitchen confirmation.'
                : `Order placed. Paid via ${req.body.payment.method.toUpperCase()} (Ref: ${req.body.payment.transactionRef || 'SIMULATED'}).`,
          },
        ],
      };

      let savedOrder: any;

      if (isConnected) {
        const order = new Order(orderData);
        savedOrder = await order.save();
      } else {
        savedOrder = {
          _id: `mem-order-${Date.now()}`,
          ...orderData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        inMemoryOrders.unshift(savedOrder);
      }

      // Notify kitchen and customers via Socket.IO
      try {
        const io = getIO();
        io.to('kitchen').emit('new_order', savedOrder);
        io.to(`order_${savedOrder.orderNumber}`).emit('order_status_update', {
          orderNumber: savedOrder.orderNumber,
          status: savedOrder.status,
          timeline: savedOrder.timeline,
        });
      } catch (socketErr) {
        // Socket.IO may not have clients yet, log gracefully
        console.log('[Socket] Notification dispatched for order:', savedOrder.orderNumber);
      }

      res.status(201).json({
        message: 'Order placed successfully',
        orderNumber: savedOrder.orderNumber,
        order: savedOrder,
      });
    } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Failed to place order' });
    }
  }
);

// GET /api/orders - List customer orders
orderRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, restaurantId, status } = req.query;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      let orders = [...inMemoryOrders];

      if (email) {
        orders = orders.filter(
          (o) => o.customerEmail?.toLowerCase() === String(email).toLowerCase()
        );
      }
      if (restaurantId) {
        orders = orders.filter((o) => String(o.restaurantId) === String(restaurantId));
      }
      if (status) {
        orders = orders.filter((o) => o.status === status);
      }

      res.status(200).json({ count: orders.length, orders, source: 'local-memory' });
      return;
    }

    const filter: Record<string, any> = {};
    if (email) {
      filter.customerEmail = String(email).toLowerCase();
    }
    if (restaurantId && mongoose.isValidObjectId(restaurantId)) {
      filter.restaurantId = restaurantId;
    }
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ count: orders.length, orders, source: 'database' });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order by ID or orderNumber
orderRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isConnected = mongoose.connection.readyState === 1;

    if (!isConnected) {
      const order = inMemoryOrders.find(
        (o) => o._id === id || o.orderNumber === id
      );
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      res.status(200).json({ order, source: 'local-memory' });
      return;
    }

    let order = null;
    if (mongoose.isValidObjectId(id)) {
      order = await Order.findById(id);
    }
    if (!order) {
      order = await Order.findOne({ orderNumber: id });
    }

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ order, source: 'database' });
  } catch (error) {
    console.error('Error fetching order detail:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// PATCH /api/orders/:id/status - Update tracking status
orderRouter.patch(
  '/:id/status',
  [
    body('status')
      .isIn([
        'placed',
        'confirmed',
        'preparing',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ])
      .withMessage('Invalid order status'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const isConnected = mongoose.connection.readyState === 1;

      const statusNotes: Record<string, string> = {
        confirmed: 'Restaurant accepted and confirmed your order.',
        preparing: 'Head Chef is preparing your customized dishes.',
        out_for_delivery: 'Rider is on the way with your hot meal.',
        delivered: 'Order has been delivered. Enjoy your meal!',
        cancelled: 'Order was cancelled.',
      };

      const timelineEvent = {
        status,
        timestamp: new Date(),
        note: note || statusNotes[status] || `Status updated to ${status}.`,
      };

      if (!isConnected) {
        const order = inMemoryOrders.find(
          (o) => o._id === id || o.orderNumber === id
        );
        if (!order) {
          res.status(404).json({ error: 'Order not found' });
          return;
        }
        order.status = status;
        order.timeline.push(timelineEvent);
        order.updatedAt = new Date().toISOString();

        try {
          getIO().emit('order_status_update', {
            orderNumber: order.orderNumber,
            status,
            timeline: order.timeline,
          });
        } catch {}

        res.status(200).json({ message: 'Order status updated', order });
        return;
      }

      const order = await Order.findOne({
        $or: [
          mongoose.isValidObjectId(id) ? { _id: id } : { orderNumber: id },
          { orderNumber: id },
        ],
      });

      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      order.status = status;
      order.timeline.push(timelineEvent);
      await order.save();

      try {
        getIO().emit('order_status_update', {
          orderNumber: order.orderNumber,
          status,
          timeline: order.timeline,
        });
      } catch {}

      res.status(200).json({ message: 'Order status updated', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
);
