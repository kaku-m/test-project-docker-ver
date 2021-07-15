FROM node:14.17.3-alpine3.11

ENV HOST 0.0.0.0

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

CMD ["npm", "run", "dev"]
