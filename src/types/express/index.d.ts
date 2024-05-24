import { JWT } from "./../custom";

export { };

console.log('Express Request User');

declare global {
    namespace Express {
        export interface Request {
            user?: JWT;
        }
    }
}