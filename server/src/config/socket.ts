import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room based on role (e.g. 'kitchen', 'riders', 'customer')
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    // Join specific order tracking room
    socket.on('join_order_room', (orderNumber: string) => {
      const room = `order_${orderNumber}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined tracking room: ${room}`);
    });

    // Handle rider GPS live location broadcast
    socket.on(
      'rider_location_update',
      (data: {
        orderNumber: string;
        riderId?: string;
        riderName?: string;
        coordinates: { lat: number; lng: number };
        heading?: number;
        etaMinutes?: number;
        distanceRemainingKm?: number;
      }) => {
        // Broadcast to customer and kitchen rooms tracking this order
        const room = `order_${data.orderNumber}`;
        socket.to(room).emit('live_rider_location', data);
        io?.to('riders').emit('rider_active_ping', data);
      }
    );

    // Handle order status updates
    socket.on('order_status_update', (data: { orderNumber: string; status: string; timeline?: any[] }) => {
      console.log(`[Socket] Order status update for ${data.orderNumber}: ${data.status}`);
      const room = `order_${data.orderNumber}`;
      io?.to(room).to('kitchen').to('riders').emit('order_status_changed', data);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};
