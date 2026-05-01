import { validationResult, matchedData } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import GroupUser from './../../models/GroupUser';

export default async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { groupID } = matchedData(req);

    const groupUsers = await GroupUser.findOne({
        where: {
            userID: req.user.id,
            groupID,
        },
    });

    if (groupUsers) {
        return next();
    } else {
        return res.status(401).json({
            msg: `You do not have access to group ${groupID}`,
            code: 65196,
        });
    }
};
