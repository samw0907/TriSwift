FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk add --no-cache python3 make g++ && npm install --omit=dev && apk del python3 make g++

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
