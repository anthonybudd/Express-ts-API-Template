# CHANGELOG

### v1.2.4 - 04/30/26
- Invite system refactored. Current process had bug preventing multiple invites to the same new email. 
- Deleted `providers/hCaptcha.ts`. Moved contents to `routes/middleware/hCaptcha.ts`
- Added `Users.deletedAt`. Users model soft-delete (`paranoid`) enabled.
- Removed `Users.inviteKey`
- Added `GroupsUsers.inviteKey`
- Major changes to `/auth/invite`, also route updated to `/auth/sign-up/with-invite`
- Major changes to `/groups/:groupID/users/invite`
- Major changes to `/groups/:groupID/users/:userID/resend-invitation-email`
- Removed generate command
- `Email.generate` moved to helpers
- `generateJWT` moved to helpers
- eslint fixed

### v1.2.3 - 04/27/26
- `Users.tos` nullable
- Commands/Scripts clean-up

### v1.2.2 - 04/24/26
- Local development SSL

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
