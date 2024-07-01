import { UserModel } from './../models/User';
import { SignOptions, sign } from 'jsonwebtoken';
import * as fs from 'fs';

export default (user: UserModel, signOptions: SignOptions) => {
    const payload = {
        id: user.get('id'),
        email: user.get('email'),
    };

    signOptions.algorithm = 'RS512';

    return sign(
        payload,
        fs.readFileSync(process.env.PRIVATE_KEY_PATH || '/app/private.pem', 'utf8'),
        signOptions
    );
};
