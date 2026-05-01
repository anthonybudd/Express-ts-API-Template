import { validationResult, matchedData } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { userID } = matchedData(req);

    if (!req.user || !req.user.id) return res.status(401).json({
        msg: 'Access error',
        code: 40115,
    });

    if (req.user.id === userID) return res.status(401).json({
        msg: 'Access error',
        code: 40116,
    });

    return next();
};

