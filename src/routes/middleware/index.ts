import isInGroup from './isInGroup';
import isGroupOwner from './isGroupOwner';
import checkPassword from './checkPassword';
import isNotSelf from './isNotSelf';
import hCaptcha from './hCaptcha';
import hasRole from './hasRole';
import isStrongPassword from './isStrongPassword';
import passport from './../../providers/Passport';

export default {
    isInGroup,
    isGroupOwner,
    checkPassword,
    isNotSelf,
    hCaptcha,
    hasRole,
    isStrongPassword,
    auth: passport.authenticate('jwt', { session: false }),
};
