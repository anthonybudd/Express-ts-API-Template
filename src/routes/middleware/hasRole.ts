import { NextFunction, Request, Response } from 'express';
import Group from './../../models/Group';
import GroupUser from './../../models/GroupUser';

export default (role: string) => async (req: Request, res: Response, next: NextFunction) => {
    const groupID = (req.params.groupID || req.body.groupID);
    if (!groupID) throw new Error('No groupID provided');
    const hasRole = await GroupUser.findOne({
        where: {
            userID: req.user.id,
            groupID,
            role,
        },
    });

    if (hasRole) {
        return next();
    } else {
        if (role === 'Admin') {
            const group = await Group.findByPk(groupID);

            if (!group) return res.status(400).json({
                msg: `Group ${groupID} does not exist`,
                code: 13386,
            });

            if (group.ownerID === req.user.id) return next();
        }

        return res.status(401).json({
            msg: `You do not have the role "${role}" in group "${groupID}"`,
            code: 10421,
        });
    }
};