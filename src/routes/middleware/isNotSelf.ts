import { NextFunction, Request, Response } from "express";

export default async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id) return res.status(401).json({
        msg: 'Access error',
        code: 18196,
    });

    if (req.user.id === req.body.userID) return res.status(401).json({
        msg: 'Access error',
        code: 18196,
    });

    return next();
};

