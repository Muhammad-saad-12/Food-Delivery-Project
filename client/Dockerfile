# Multi-stage Dockerfile for Client Frontend
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Nginx production stage for static frontend assets
FROM nginx:alpine AS runner

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx/client.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
