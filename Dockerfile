FROM node:22

RUN apt update && apt install -y vim moreutils
RUN npm install -g nodemon mocha sequelize sequelize-cli mysql2 eslint ts-node 

WORKDIR /app
COPY . /app
RUN npm install

ENTRYPOINT [ "ts-node", "src/index.ts" ]
