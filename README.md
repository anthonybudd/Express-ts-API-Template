# Express.ts API Template

<img height="75" src="https://raw.githubusercontent.com/anthonybudd/anthonybudd/master/img/express-ts-api-template.png?v=1"/>

A mimimal REST API template using Express.ts, Sequelize and MySQL.

- 🔑 Auth using JWT's with Passport.js. Optional 2FA.
- ✅ Full Test Coverage with Mocha.js
- 🔐 Local SSL Termination with NGINX. Optional.
- 👥 Simple DB Structure: `Users` -⚟ `GroupsUsers` ⚞- `Groups`
- 🖥️ ShadCN x Vue3 UI: [AnthonyBudd/Shadcn-Vue-SaaS-Template](https://github.com/anthonybudd/Shadcn-Vue-SaaS-Template)
- 🥇 Real-world tested, handled over $50M of live transactions

<p align="center">
  <a href="https://www.youtube.com/watch?v=nA5UFuqjQgk">
  <img width="350" src="https://raw.githubusercontent.com/anthonybudd/anthonybudd/master/img/express-ts-api-temaplate-thumbnail.png" alt="YouTube Video">
  </a>
  </br>
  <a href="https://youtu.be/nA5UFuqjQgk">
  Getting Started: youtu.be/nA5UFuqjQgk
  </a>
</p>

```sh
git clone git@github.com:anthonybudd/express-ts-api-template.git
cd express-ts-api-template

# [Optional] Find & Replace (case-sensaive, whole repo): "express-api" => "your-api-name" 
LC_ALL=C find . -type f -name '*.*' -exec sed -i '' s/express-api/your-api-name/g {} +

# Local SSL Cert for HTTPS and RSA key for JWT signing
openssl req -x509 -nodes -days 825 -newkey rsa:2048 -keyout key.pem -out cert.pem -subj "/CN=localhost/O=dev/C=US"
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -outform PEM -pubout -out public.pem

# Start app
cp .env.example .env
npm install
docker compose up
npm run exec:db:refresh
npm run exec:test

# [Optional] Code generation command
npm run generate -- --model="Book"
npm run exec:db:refresh
```

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

Above each route you will see a large comment block with the decorator `@swagger`, these comments are optional and can be removed if you do not want them. To generate a new OpenAPISpec run the command `
npm run exec:openapispec`

I have found when building large commercial API's that it is far more practical to document the routes next to the code rather than manually updating the OpenAPISpec each time a route is created or modified.


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


### Generate SDK Client Libraries
There is an [OpenAPISpec](./OpenApiSpec.yml) in the root of the repo. The project includes code generation config files for PHP, JavaScript and Swift. Use the below command to generate SDK Client Libraries for your API to `/sdk/dist`. A full list of supported langauages [can be found here.](https://github.com/OpenAPITools/openapi-generator?tab=readme-ov-file#overview)


```sh
npm run build-sdk
```


### Deployment
Full Kubernetes deployment instructions can be found in [k8s/Deployment.md](./k8s/Deployment.md).

- [api.deployment.yml](./k8s/api.deployment.yml)
- [api.service.yml](./k8s/api.service.yml)
- [api.ingress.yml](./k8s/api.ingress.yml)

```sh
kubectl apply -f .k8s/api.deployment.yml \
  -f .k8s/api.ingress.yml \
  -f .k8s/api.service.yml 
```


### Routes
| Method      | Route                                                           | Description                           | Payload                               | Response          | 
| ----------- | --------------------------------------------------------------- | ------------------------------------- | ------------------------------------- | ----------------- |  
| GET         | `/_readiness`                                                   | Kuber readiness check                 | --                                    | "healthy"         |  
| **Auth**    |                                                                 |                                       |                                       |                   |  
| POST        | `/api/v1/auth/login`                                            | Login                                 | {email, password}                     | {accessToken}     |  
| POST        | `/api/v1/auth/sign-up`                                          | Sign-up                               | {email, password, firstName, tos}     | {accessToken}     |  
| GET         | `/api/v1/_authcheck`                                            | Returns {auth: true} if has auth      | --                                    | {auth: true}      |  
| GET         | `/api/v1/auth/verify-email/:emailVerificationKey`               | Verify email                          | --                                    | {success: true}   |  
| GET         | `/api/v1/auth/resend-verification-email`                        | Resend verification email             | --                                    | {email}           |  
| POST        | `/api/v1/auth/forgot`                                           | Forgot                                | {email}                               | {success: true}   |  
| GET         | `/api/v1/auth/get-user-by-reset-key/:passwordResetKey`          | Get user for given `passwordResetKey` | --                                    | {id, email}       |  
| POST        | `/api/v1/auth/reset`                                            | Reset password                        | {email, password, passwordResetKey}   | {accessToken}     |  
| GET         | `/api/v1/auth/get-user-by-invite-key/:inviteKey`                | Get user for given `inviteKey`        | --                                    | {id, email}       |  
| POST        | `/api/v1/auth/invite`                                           | Complete user invite process          | {inviteKey, email, password, ...}     | {accessToken}     |   
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

### Commands
There are a few helper scripts and commands for interacting with the application.

Some commands need to be run inside the docker container, these commands have been aliased with an underscore prefix, for exmaple `npm run exec:db:refresh` is an alias for `docker exec -ti express-api npm run db:refresh` which actually runs `./src/scripts/refresh`
| Command               | Description                   | Exmaple                          | 
| --------------------- | ----------------------------- | -------------------------------- |
| generate.ts           | Code generation               | `npm run generate -- --model="book"` |
| renderEmail.ts        | Generate an email locally     | `docker exec -ti express-api ts-node ./src/scripts/renderEmail.ts --template="Verify" --code="512616" --link="https://google.com"` |
| jwt.ts                | Generate JWT for a user       | `docker exec -ti express-api ts-node ./src/scripts/jwt.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"` |
| forgotPassword.ts     | Generate password reset link  | `docker exec -ti express-api ts-node ./src/scripts/forgotPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e"` |
| setPassword.ts        | Set user password             | `docker exec -ti express-api ts-node ./src/scripts/setPassword.ts --userID="c4644733-deea-47d8-b35a-86f30ff9618e" --password="password"` |

