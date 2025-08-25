# syntax = docker/dockerfile:1

FROM node:20.14.0-slim AS build
WORKDIR /app


ARG REACT_APP_MAPBOX_TOKEN
ENV REACT_APP_MAPBOX_TOKEN=$REACT_APP_MAPBOX_TOKEN

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20.14.0-slim
WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build /app/build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]