import { validationResult, matchedData } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    let { password, newPassword } = matchedData(req);
    if (newPassword) password = newPassword;

    try {
        if (password.length < 7) throw new Error('Password must be at least 8 characters');
        if (!(/[^A-Za-z0-9]/).test(password)) throw new Error('Password must contain at least one special character');
        if (!(/[A-Z]/).test(password)) throw new Error('Password must contain at least one uppercase character');
        if (!(/[a-z]/).test(password)) throw new Error('Password must contain at least one lowercase character');
        if (!(/[0-9]/).test(password)) throw new Error('Password must contain at least one number');
        return next();
    } catch (error) {
        let field = 'password';
        if (newPassword) field = 'newPassword';
        if (error instanceof Error) return res.status(422).json({
            errors: {
                [field]: {
                    location: 'body',
                    param: field,
                    msg: error.message
                }
            }
        });
    }
};
