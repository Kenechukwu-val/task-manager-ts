import dotenv from 'dotenv';
import { httpServer, io } from './app';

dotenv.config();

const PORT = process.env.PORT || 5000;

const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    io.close();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready`);
});
