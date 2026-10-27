import type { Server } from 'node:http';
import db from './db';

export let shutdownPromise: Promise<void> | undefined;
export let isShuttingDown = false;

export const onShutdown = async (server: Server, deadlineMs: number = 25_000): Promise<void> => {
    if (shutdownPromise === undefined) shutdownPromise = gracefulShutdown(server, deadlineMs);
    return shutdownPromise;
};

const gracefulShutdown = async (server: Server, deadlineMs: number = 25_000): Promise<void> => {
    isShuttingDown = true;
    console.log('Shutting down...');

    const deadline = setTimeout(() => {
        console.error('Graceful shutdown deadline exceeded');
        server.closeAllConnections();
        process.exit(1);
    }, deadlineMs);

    try {
        // Close HTTP server
        await new Promise<void>((resolve, reject) => server.close((error?: Error) => {
            if (error) return reject(error);
            resolve();
        }));
        console.info('HTTP server drained');

        // Close database connections
        await db.connectionManager.close();
        console.info('Database connections closed');


        console.info('Graceful shutdown completed');
    } catch (error: unknown) {
        console.error({ error }, 'Shutdown failed');
        process.exitCode = 1;
    } finally {
        clearTimeout(deadline);
    }
};