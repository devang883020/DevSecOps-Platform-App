# =========================
# Stage 1 - Build Stage
# =========================
FROM node:18-alpine AS builder

WORKDIR /app
 
# Copy package files  
COPY package*.json ./  
  
# Install dependencies 
RUN npm install 
 
# Copy application code
COPY . . 

# =========================
# Stage 2 - Production Stage
# =========================
FROM node:18-alpine 

WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only required files from builder
COPY --from=builder /app ./

# Remove development dependencies
RUN npm prune --production

# Change ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose backend port
EXPOSE 3500

# Start application
CMD ["node", "index.js"]
