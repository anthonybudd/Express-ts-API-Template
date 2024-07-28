import { NextFunction, Request, Response } from "express";
import { EmptyResultError } from "sequelize";

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof EmptyResultError) {
        return res.status(404).json({
            msg: `Not found`,
            code: 404,
        });
    }

    if (process.env.NODE_ENV === "development") {
        return res.status(500).json({
            msg: err.message,
            code: 500,
        });
    } else {
        return res.status(500).json({
            msg: `Error`,
            code: 500,
        });
    }
};