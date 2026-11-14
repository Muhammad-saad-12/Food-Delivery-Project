import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocket = (server: HttpServer): SocketIOServer => {
  const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  io = new SocketIOServer(server, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room based on role (e.g. 'kitchen', 'waiter', 'admin')
    socket.on('join_room', (room: string) => {
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    // Handle order status updates
    socket.on('order_status_update', (data: { orderId: string; status: string }) => {
      console.log(`[Socket] Order update:`, data);
      io?.to('kitchen').to('waiter').emit('order_status_changed', data);
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
