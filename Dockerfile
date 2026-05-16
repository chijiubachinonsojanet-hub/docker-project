# ── Stage 1: Build ──────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies first (enables layer caching)
COPY package*.json ./
RUN npm install --only=production

# ── Stage 2: Production ─────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Security: never run as root
USER node

CMD ["node", "app.js"]