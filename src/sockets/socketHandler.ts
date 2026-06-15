import { Server as SocketServer, Socket } from 'socket.io';
import { Server } from 'http';
import { supabase } from '../config/supabase';

export const setupSocket = (httpServer: Server) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    io.use(async (socket: Socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return next(new Error('Authentication error: Invalid token'));
        }

        socket.data.userId = user.id;
        next();
    });

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.data.userId} | Socket ID: ${socket.id}`);

        socket.join(socket.data.userId);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.userId}`);
        });
    });

    return io;
}

export const emitTaskEvent = (io: SocketServer, event: string, data: any, userId?: string) => {
    if (userId) {
        io.to(userId).emit(event, data);
    }else {
        io.emit(event, data);
    }
};
