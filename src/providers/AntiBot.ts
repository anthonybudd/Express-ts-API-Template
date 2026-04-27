/** AB: Experimental global anti-bot middleware.
 * 
 * src/app.js:
 *     import AntiBot from './providers/AntiBot';
 *     ...
 *     app.use(AntiBot());
 */

import { NextFunction, Request, Response } from 'express';

interface BanEntry {
    ip: string;
    bannedAt: number;
    expiresAt: number;
}

interface AntiBotConfig {
    banDurationMs?: number; // How long to ban IPs (default: 24 hours)
    whitelist?: string[]; // IPs that should never be banned
    protectedEndpoints?: string[]; // Additional protected endpoints
    enableLogging?: boolean; // Whether to log ban events
}

// In-memory store with expiration tracking
const bannedIPsStore: Map<string, BanEntry> = new Map();

// Whitelist of IPs that should never be banned (e.g., admin IPs, monitoring tools)
const whitelist: Set<string> = new Set([
    // Add whitelisted IPs here
    // '127.0.0.1',
    // '::1',
]);

// Use Set for O(1) lookup instead of Array.includes() O(n)
const protectedEndpoints: Set<string> = new Set([
    '/.env',
    '/.env.txt',
    '/.env.example',
    '/.env.local',
    '/.env.development.local',
    '/.env.test.local',
    '/.env.production.local',
    '/.env.development',
    '/.env.test',
    '/.env.production',
    '/wp-config.php.old',
    '/wp-config.old',
    '/wp-config.txt',
    '/wordpress/wp-config.php.txt',
    '/wp-config.php.backup',
    '/wp-config.php.dist',
    '/blog/wp-config.php.bak',
]);

// Default configuration
const defaultConfig: Required<AntiBotConfig> = {
    banDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    whitelist: [],
    protectedEndpoints: [],
    enableLogging: true,
};

/**
 * Extracts the real client IP address, handling reverse proxies and load balancers
 */
function getClientIP(req: Request): string | null {
    // Check X-Forwarded-For header (most common proxy header)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        // X-Forwarded-For can contain multiple IPs, the first one is the original client
        const ips = Array.isArray(forwardedFor)
            ? forwardedFor[0]
            : forwardedFor.split(',')[0].trim();
        return ips || null;
    }

    // Check X-Real-IP header (nginx proxy)
    const realIP = req.headers['x-real-ip'];
    if (realIP && typeof realIP === 'string') {
        return realIP;
    }

    // Fallback to req.ip (requires trust proxy to be set in Express)
    return req.ip || req.socket.remoteAddress || null;
}

/**
 * Normalizes path for case-insensitive matching
 */
function normalizePath(path: string): string {
    return path.toLowerCase();
}

/**
 * Checks if an IP is currently banned (and not expired)
 */
function isBanned(ip: string): boolean {
    const banEntry = bannedIPsStore.get(ip);
    if (!banEntry) return false;

    // Check if ban has expired
    if (Date.now() > banEntry.expiresAt) {
        bannedIPsStore.delete(ip);
        return false;
    }

    return true;
}

/**
 * Bans an IP address for the configured duration
 */
function banIP(ip: string, config: Required<AntiBotConfig>): void {
    const now = Date.now();
    bannedIPsStore.set(ip, {
        ip,
        bannedAt: now,
        expiresAt: now + config.banDurationMs,
    });
}

/**
 * Cleans up expired bans (should be called periodically)
 */
function cleanupExpiredBans(): void {
    const now = Date.now();
    for (const [ip, banEntry] of bannedIPsStore.entries()) {
        if (now > banEntry.expiresAt) {
            bannedIPsStore.delete(ip);
        }
    }
}

// Cleanup expired bans every hour
setInterval(cleanupExpiredBans, 60 * 60 * 1000);

/**
 * AntiBot middleware factory
 * Creates middleware to detect and ban bots accessing protected endpoints
 */
export default function AntiBot(config: AntiBotConfig = {}) {
    const finalConfig: Required<AntiBotConfig> = {
        ...defaultConfig,
        ...config,
    };

    // Merge additional protected endpoints
    if (finalConfig.protectedEndpoints.length > 0) {
        finalConfig.protectedEndpoints.forEach(endpoint => {
            protectedEndpoints.add(endpoint);
        });
    }

    // Merge whitelist
    if (finalConfig.whitelist.length > 0) {
        finalConfig.whitelist.forEach(ip => {
            whitelist.add(ip);
        });
    }

    return (req: Request, res: Response, next: NextFunction): void => {
        const clientIP = getClientIP(req);

        // Skip if no IP could be determined
        if (!clientIP) {
            return next();
        }

        // Check whitelist first
        if (whitelist.has(clientIP)) {
            return next();
        }

        const normalizedPath = normalizePath(req.path);

        // Check if accessing a protected endpoint
        if (protectedEndpoints.has(normalizedPath)) {
            // Ban the IP if not already banned
            if (!isBanned(clientIP)) {
                banIP(clientIP, finalConfig);

                if (finalConfig.enableLogging) {
                    console.warn(`[AntiBot] Banned IP: ${clientIP} for accessing protected endpoint: ${req.path}`);
                }
            }

            // Return 404 to avoid revealing that the endpoint exists
            res.status(404).json({
                error: 'Not Found',
                message: 'The requested resource was not found.',
            });
            return;
        }

        // Check if IP is banned
        if (isBanned(clientIP)) {
            if (finalConfig.enableLogging) {
                console.warn(`[AntiBot] Blocked banned IP: ${clientIP} accessing ${req.path}`);
            }

            // Return 403 Forbidden for banned IPs
            res.status(403).json({
                error: 'Forbidden',
                message: 'Access denied.',
            });
            return;
        }

        // IP is not banned, continue
        return next();
    };
}

// Export utility functions for external use (e.g., admin endpoints)
export const AntiBotUtils = {
    isBanned,
    banIP,
    unbanIP: (ip: string) => bannedIPsStore.delete(ip),
    getBannedIPs: () => Array.from(bannedIPsStore.keys()),
    getBanInfo: (ip: string) => bannedIPsStore.get(ip),
    cleanupExpiredBans,
};