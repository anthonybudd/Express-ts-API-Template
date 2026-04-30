# Express.ts API Template

<img height="75" src="https://raw.githubusercontent.com/anthonybudd/anthonybudd/master/img/express-ts-api-template.png?v=1"/>

A minimal REST API template using Express.ts, Sequelize and MySQL.

- 🔑 Auth using JWT's with Passport.js. Optional 2FA.
- ✅ Full Test Coverage with Mocha.js
- 🔒 Local SSL Termination with NGINX. Optional.
- 👥 Simple DB Structure: `Users` -⚟ `GroupsUsers` ⚞- `Groups`
- 🖥️ ShadCN x Vue3 UI: [AnthonyBudd/Shadcn-Vue-SaaS-Template](https://github.com/anthonybudd/Shadcn-Vue-SaaS-Template)
- 🥇 Real-World Tested. Handled Over $50M Live Transactions!

<p align="center">
  <a href="https://www.youtube.com/watch?v=PwZWUVhFmmQ">
  <img width="350" src="https://raw.githubusercontent.com/anthonybudd/anthonybudd/master/img/express-ts-api-temaplate-thumbnail.png" alt="YouTube Video">
  </a>
  </br>
  <a href="https://youtu.be/PwZWUVhFmmQ">
  Getting Started: youtu.be/PwZWUVhFmmQ
  </a>
</p>

```sh
git clone git@github.com:anthonybudd/express-ts-api-template.git
cd express-ts-api-template

# [Optional] Find & Replace (case-sensitive, whole repo): "express-api" => "your-api-name" 
LC_ALL=C find . -type f -name '*.*' -exec sed -i '' s/express-api/your-api-name/g {} +

# Local SSL Cert for HTTPS and RSA key for JWT signing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl.key -out ssl.cert -subj "/CN=localhost/O=dev/C=US"
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem

# Start app
cp .env.example .env
npm install
docker compose up
npm run exec:db:refresh
npm run exec:test

curl -k -X POST https://localhost/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "Password@1234"
  }'
```

# Contents
- [DB Structure](#db-structure) - DB structure and design philosophy
- [Open API Spec](#openapispec) - Generate an OpenApiSpec.yml with one command
- [Auto-Generated Client-Side SDKs](#auto-generated-client-side-sdks) - Use the OpenAPISpec to generate client SDKs
- [Deployment](#deployment) - Full Kubernetes deployment guide
- [Commands](#commands) - Lots of useful helper commands
- [Routes](#routes) - Table of routes


### DB Structure
The DB structure is the optimum balance of functionality and minimalism. A User can belong to many Groups through the GroupsUsers table. This allows you to make very basic single-user applications that do not even require the concept of groups or full SaaS solutions with complex User-Group relationships.

```                                                                
+--------------+           +---------------+         +--------------+  
| Users        | --------⚟ | GroupsUsers   | ⚞------ | Groups       |  
|--------------|           |---------------|         |--------------|  
| id           |           | id            |         | id           |  
| email        |           | groupID       |         | name         |  
| password     |           | userID        |         | ownerID      |  
| firstName    |           | role          |         | createdAt    |  
| lastName     |           | createdAt     |         | updatedAt    |
| createdAt    |           | updatedAt     |         +--------------+  
| updatedAt    |           +---------------+                                            
| ...          |                                                      
+--------------+                      
```


### OpenAPISpec

Above each route you will see a large comment block with the `@swagger` decorator, these comments are optional and can be removed if you do not want them. I have found when building large commercial API's that it is far more practical to document the routes with comments next to the code rather than manually updating an Open API Spec each time a route is created or modified. 

To generate a new OpenAPISpec.yml run the command `npm run exec:openapispec`


```js
/**
 * @swagger
 * /auth/login:
 *   post:
 *     description: Get an access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         ... 
 */
app.post('/auth/login', [
```


### Auto-Generated Client-Side SDKs
There is an [Open API Spec](./OpenApiSpec.yml) in the root of the repo. The project includes code generation config files for PHP, JavaScript and Swift. Use the below command to generate SDK Client Libraries for your API to `/sdk/dist`. A full list of supported languages [can be found here.](https://github.com/OpenAPITools/openapi-generator?tab=readme-ov-file#overview)


```sh
npm run build-sdk
```


### Deployment
Full Kubernetes deployment instructions can be found in [k8s/Deployment.md](./k8s/Deployment.md).

```sh
kubectl apply -f ./k8s/api.deployment.yml \
  -f ./k8s/api.service.yml 
```


### Commands
There are a few helper scripts and commands for interacting with the API.

Some commands need to be executed inside the Node docker container, for ease of use these commands are aliased with the prefix `exec:`. These prefixed commands will run the underlying commands but inside the container using `docker exec`, for example `npm run exec:db:refresh` will actually call `docker exec -ti express-api npm run db:refresh`.

| Command                          | Description                     | Example                          | 
| -------------------------------- | ------------------------------- | -------------------------------- |
| [refresh](./src/scripts/refresh) | Delete the DB, rebuild and seed | `npm run exec:db:refresh` |
| [test](./src/tests)              | Run the test suite              | `npm run exec:test` |
| [openapispec](./package.json)    | Generate a new OpenAPISpec.yml  | `npm run exec:openapispec` |
| [build-sdk](./package.json)      | Generate client-side SDKs       | `npm run build-sdk` |
| [generateEmail.ts](./src/scripts/generateEmail.ts)| Generate a HTML email locally  | `docker exec -ti express-api ts-node ./src/scripts/generateEmail.ts --template="Verify" --code="512616" --link="https://google.com"` |
| [generateJWT.ts](.src/scripts/generateJWT.ts)     | Generate a JWT for a user by ID  | `docker exec -ti express-api ts-node ./src/scripts/generateJWT.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"` |
| [forgotPasswordLink.ts](./src/scripts/forgotPasswordLink.ts) | Generate password reset link  | `docker exec -ti express-api ts-node ./src/scripts/forgotPasswordLink.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"` |
| [setPassword.ts](.src/scripts/setPassword.ts) | Set user password              | `docker exec -ti express-api ts-node ./src/scripts/setPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e" --password="password"` |


### Routes
| Method      | Route                                                           | Description                           | Payload                               | Response          | 
| ----------- | --------------------------------------------------------------- | ------------------------------------- | ------------------------------------- | ----------------- |  
| GET         | `/_readiness`                                                   | Kubernetes readiness check            | --                                    | "healthy"         |  
| **Auth**    |                                                                 |                                       |                                       |                   |  
| POST        | `/api/v1/auth/login`                                            | Login                                 | {email, password}                     | {accessToken}     |  
| POST        | `/api/v1/auth/sign-up`                                          | Sign-up                               | {email, password, firstName, tos}     | {accessToken}     |  
| POST        | `/api/v1/auth/sign-up/with-invite`                              | Complete user invite process          | {inviteKey, email, password, ...}     | {accessToken}     |   
| GET         | `/api/v1/auth/verify-email/:emailVerificationKey`               | Verify email                          | --                                    | {success: true}   |  
| GET         | `/api/v1/auth/resend-verification-email`                        | Resend verification email             | --                                    | {email}           |  
| POST        | `/api/v1/auth/forgot`                                           | Forgot                                | {email}                               | {success: true}   |  
| POST        | `/api/v1/auth/reset`                                            | Reset password                        | {email, password, passwordResetKey}   | {accessToken}     |  
| GET         | `/api/v1/auth/get-user-by-reset-key/:passwordResetKey`          | Get user for given `passwordResetKey` | --                                    | {id, email}       |  
| GET         | `/api/v1/auth/get-user-by-invite-key/:inviteKey`                | Get user for given `inviteKey`        | --                                    | {id, email}       |  
| GET         | `/api/v1/_authcheck`                                            | Returns {auth: true} if has auth      | --                                    | {auth: true}      |  
| **User**    |                                                                 |                                       |                                       |                   |  
| GET         | `/api/v1/user`                                                  | Get the current user                  |                                       | {User}            |  
| POST        | `/api/v1/user`                                                  | Update the current user               | {firstName, lastName}                 | {User}            |  
| POST        | `/api/v1/user/update-password`                                  | Update password                       | {password, newPassword}               | {success: true}   |
| **Groups**  |                                                                 |                                       |                                       |                   |  
| GET         | `/api/v1/groups/:groupID`                                       | Returns group by ID                   | --                                    | {Group}           |  
| POST        | `/api/v1/groups/:groupID`                                       | Update group by ID                    | {name: 'New Name'}                    | {Group}           |  
| POST        | `/api/v1/groups/:groupID/users/invite`                          | Invite user to group                  | {email}                               | {UserID, GroupID} |  
| POST        | `/api/v1/groups/:groupID/users/:userID/resend-invitation-email` | Resend invitation email               | {}                                    | {email}           |  
| POST        | `/api/v1/groups/:groupID/users/:userID/set-role`                | Set user role                         | {role: 'User'/'Admin' }               | {UserID, role}    |  
| DELETE      | `/api/v1/groups/:groupID/users/:userID`                         | Remove user from group                | --                                    | {UserID}          |  

