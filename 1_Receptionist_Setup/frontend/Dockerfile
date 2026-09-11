# Stage 1: Build
FROM node:18-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Runner
FROM node:18-slim AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
RUN npm install --only=production --legacy-peer-deps
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
