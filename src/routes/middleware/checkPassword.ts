import { NextFunction, Request, Response } from "express";
import User from './../../models/User';
import bcrypt from 'bcryptjs';

export default async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.password) return res.status(422).json({
        errors: {
            components: {
                location: 'body',
                param: 'password',
                msg: 'Password must be provided'
            }
        }
    });

    const user = await User.unscoped().findOne({
        where: { id: req.user.id }
    });

    if (!user) return res.status(401).json({
        msg: 'Incorrect password',
        code: 92294,
    });

    bcrypt.compare(req.body.password, user.password, (err, compare) => {
        if (err) return res.status(401).json({
            msg: 'Incorrect password',
            code: 96294,
        });

        if (compare) {
            return next();
        } else {
            return res.status(401).json({
                msg: 'Incorrect password',
                code: 92298,
            });
        }
    });

};