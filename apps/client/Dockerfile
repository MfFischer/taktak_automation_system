# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/types/package*.json ./packages/types/
COPY apps/client/package*.json ./apps/client/

# Install dependencies
RUN npm ci --workspace=@taktak/types --workspace=@taktak/client

# Copy source code
COPY packages/types ./packages/types
COPY apps/client ./apps/client
COPY tsconfig.json ./

# Build
RUN npm run build --workspace=@taktak/types
RUN npm run build --workspace=@taktak/client

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/apps/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

