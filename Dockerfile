FROM node:24

RUN apt update
RUN apt install -y vim moreutils
RUN npm install -g nodemon sequelize sequelize-cli mysql2 eslint ts-node 

WORKDIR /app
COPY . /app
RUN npm install

ENTRYPOINT [ "ts-node", "src/index.ts" ]
