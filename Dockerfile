# Multi-stage Dockerfile for Node.js Application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /usr/src/app/server
RUN npm install

# Build TypeScript source
COPY server/ ./
RUN npm run build

# Production runtime stage
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy compiled JavaScript output
COPY --from=builder /usr/src/app/server/dist ./dist

# Create non-root user for security
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
