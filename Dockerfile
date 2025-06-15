# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install pnpm if package-lock doesn't exist (prefer pnpm)
RUN if [ ! -f package-lock.json ]; then npm install -g pnpm && pnpm install --frozen-lockfile; else npm ci --only=production; fi

# Copy source code
COPY src/ ./src/

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S paybadge -u 1001

# Change ownership of app directory
RUN chown -R paybadge:nodejs /app
USER paybadge

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["node", "src/server.js"]