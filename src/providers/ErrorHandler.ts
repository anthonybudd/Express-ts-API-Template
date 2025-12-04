import { NextFunction, Request, Response } from "express";
import { EmptyResultError } from "sequelize";

export default (err: Error, req?: Request, res?: Response, next?: NextFunction) => {

    // Add your own code for handling errors here
    if (!(err instanceof EmptyResultError)) console.error(err);

    // If being used as middlware, respond
    if (res) {
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
    }
};