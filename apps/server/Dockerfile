# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/server/package*.json ./apps/server/

# Install dependencies
RUN npm ci --workspace=@taktak/types --workspace=@taktak/server

# Copy source code
COPY packages/types ./packages/types
COPY apps/server ./apps/server
COPY tsconfig.json ./

# Build
RUN npm run build --workspace=@taktak/types
RUN npm run build --workspace=@taktak/server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/server/package*.json ./apps/server/

# Install production dependencies only
RUN npm ci --workspace=@taktak/types --workspace=@taktak/server --omit=dev

# Copy built files
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create logs directory
RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "apps/server/dist/index.js"]

