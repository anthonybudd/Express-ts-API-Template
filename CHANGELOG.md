# CHANGELOG

### v1.2.2 - 04/24/26
- Local Development SSL

### v1.2.1 - 04/13/26
- Node 24 LTS 

### v1.2.0 - 03/26/26
- New Email Template
- Login attempts logged in `LoginAttempts` table.
- Rate limiting on all routes

### v1.1.0 - 03/15/26
- Tests fixed

### v0.22 - 03/12/26
- Removed all instances of `req.params` and `req.body` (except in `hCaptcha.ts` and `checkPassword.ts`) from routes and middleware

### v0.21 - 26/11/25
- Removed `User.mfaRequired` virtual property, not needed, can use existing `User.mfaEnabled`
