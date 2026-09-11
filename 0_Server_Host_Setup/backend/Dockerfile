# Stage 1: Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY tsconfig.json ./
COPY src/ ./src
RUN npm run build

# Stage 2: Production Run
FROM node:18 AS runner
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production
RUN npx prisma generate
COPY --from=builder /app/dist ./dist
ENV NODE_ENV=production
EXPOSE 5000
CMD npx prisma db push --accept-data-loss && node dist/index.js
