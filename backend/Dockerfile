# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (with build tools for native modules)
RUN apk add --no-cache --virtual .build-deps python3 make g++ && \
    npm ci --omit=dev && \
    apk del .build-deps

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create export directory for generated files
RUN mkdir -p /data/exports

# Expose the application port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
