# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
# Use npm ci if package-lock.json exists, otherwise use npm install
RUN npm ci

# Copy source code
COPY src ./src

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
# Use npm ci if package-lock.json exists, otherwise use npm install
RUN if [ -f package-lock.json ]; then \
      npm ci --only=production && npm cache clean --force; \
    else \
      npm install --only=production && npm cache clean --force; \
    fi

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy necessary files for mail templates
COPY --chown=nestjs:nodejs src/mail/template ./dist/mail/template

# Switch to non-root user
USER nestjs

# Expose the port the app runs on
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200/api', (r) => {process.exit(r.statusCode === 404 ? 0 : 1)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]

