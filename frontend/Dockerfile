# syntax = docker/dockerfile:1

# Build stage
FROM node:20.14.0-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20.14.0-slim
WORKDIR /app

RUN npm install -g serve

# ⬇️ CRA outputs to `build`, not `dist`
COPY --from=build /app/build /app/build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# ⬇️ Serve the `build` folder
CMD ["serve", "-s", "build", "-l", "3000"]
