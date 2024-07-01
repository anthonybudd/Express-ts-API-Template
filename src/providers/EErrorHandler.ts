import { NextFunction, Request, Response } from "express";

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (process.env.NODE_ENV === "development") {
        res.status(500).json({
            msg: err.message,
            code: 500,
        });
    } else {
        res.status(500).json({
            msg: `Error`,
            code: 500,
        });
    }

    return next();
};