import express from 'express';
import crypto from 'crypto';

export default (err: Error, res?: express.Response) => {
    console.error(err);

    if (res && !res.headersSent) res.status(500).json({
        msg: `Error`,
        code: crypto.randomBytes(32).toString('base64'),
    });
};
