import { Server as SocketServer, Socket} from 'socket.io';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    userId: string;
};

export const setupSocket = (httpServer: Server) => {
    const io = new SocketServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware to authenticate socket connections
    io.use(( socket: Socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if ( !token ) {
            return next(new Error('Authentication error: No token provided'));
        }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
            socket.data.userId = decoded.userId; // Store userId in socket data for later use
            next();
        } catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 User connected: ${socket.data.userId} | Socket ID: ${socket.id}`);

        //join a room based on userId to send targeted updates
        socket.join(socket.data.userId);

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.data.userId}`);
        });
    });

    return io;
};

//Helper function to emit task updates to a specific user
export const emitTaskEvent = ( io: SocketServer, event: string, data: any, userId?: string) => {
    if (userId) {
        io.to(userId).emit(event, data); // Send only to specific user
    } else {
        io.emit(event, data); // Broadcast to all connected clients
    }
}