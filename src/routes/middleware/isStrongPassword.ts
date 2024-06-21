import { NextFunction, Request, Response } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
    try {
        let password = req.body.password;
        if (req.body.newPassword) password = req.body.newPassword;
        if (password.length < 7) throw new Error('Password must be at least 8 characters');
        if (!(/[^A-Za-z0-9]/).test(password)) throw new Error('Password must contain at least one special character');
        if (!(/[A-Z]/).test(password)) throw new Error('Password must contain at least one uppercase character');
        if (!(/[a-z]/).test(password)) throw new Error('Password must contain at least one lowercase character');
        if (!(/[0-9]/).test(password)) throw new Error('Password must contain at least one number');
        return next();
    } catch (error) {
        let field = 'password';
        if (req.body.newPassword) field = 'newPassword';
        if (error instanceof Error) return res.status(422).json({
            errors: {
                [field]: {
                    location: field,
                    param: field,
                    msg: error.message
                }
            }
        });
    }
};
