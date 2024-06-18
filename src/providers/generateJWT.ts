import { UserModel } from './../models/User';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import * as fs from 'fs';


const generateJWT = (user: UserModel) => {
    const payload = {
        id: user.get('id'),
        email: user.get('email'),
    };

    let expiresIn = moment(new Date()).add(1, 'day').unix();
    // if (Array.isArray(expires) && expires.length === 2) {
    //     expiresIn = moment(new Date()).add(expires[0], expires[1]).unix();
    // } else if (typeof expires === 'string') {
    //     expiresIn = moment(expires, 'YYYY-MM-DD HH:mmZ').unix();
    // }
    return jwt.sign(payload, fs.readFileSync(process.env.PRIVATE_KEY_PATH || '/app/private.pem', 'utf8'), {
        expiresIn,
        algorithm: 'RS512',
    });
};

export default generateJWT;