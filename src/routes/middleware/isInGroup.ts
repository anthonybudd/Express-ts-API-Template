import { NextFunction, Request, Response } from "express";
import GroupUser from './../../models/GroupUser';

export default async (req: Request, res: Response, next: NextFunction) => {
    const groupID = (req.params.groupID || req.body.groupID);
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
