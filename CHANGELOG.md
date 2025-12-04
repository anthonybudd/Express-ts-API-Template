# Changes 

### v0.22 - 03/12/25
- Removed all instances of `req.params` and `req.body` (except in `hCaptcha.ts` and `checkPassword.ts`) from routes and middleware

### v0.21 - 26/11/25
- Removed `User.mfaRequired` virtual property, not needed, can use existing `User.mfaEnabled`
