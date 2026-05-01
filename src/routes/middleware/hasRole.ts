import { validationResult, matchedData } from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import GroupUser from './../../models/GroupUser';
import Group from './../../models/Group';

export default (role: string) => async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.mapped() });
    const { groupID } = matchedData(req);

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