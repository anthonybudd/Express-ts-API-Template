import { NextFunction, Request, Response } from "express";
import Group from './../../models/Group';

export default async (req: Request, res: Response, next: NextFunction) => {
    const groupID = (req.params.groupID || req.body.groupID);
    const group = await Group.findByPk(groupID);

    if (group && group.ownerID === req.user.id) {
        return next();
    } else {
        return res.status(401).json({
            msg: `You are not the owner of this group ${groupID}`,
            code: 55213,
        });
    }
};
