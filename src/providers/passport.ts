import { ExtractJwt as ExtractJWT, Strategy as JWTStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from './../models/User';
import bcrypt from 'bcrypt-nodejs';
import passport from 'passport';
import * as fs from 'fs';


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email: string, password: string, cb: Function) => {

    const user = await User.unscoped().findOne({
        where: { email },
    });

    if (!user) return cb(null, false);

    return bcrypt.compare(password, user.get('password'), (err, compare) => {
        if (compare) {
            return cb(null, user);
        } else {
            return cb(null, false);
        }
    });
}));


passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([
        ExtractJWT.fromAuthHeaderAsBearerToken(),
        ExtractJWT.fromUrlQueryParameter('token'),
    ]),
    secretOrKey: fs.readFileSync(process.env.PUBLIC_KEY_PATH || '/app/public.pem', 'utf8'),
}, (jwtPayload, cb) => cb(null, jwtPayload)));


export default passport;
