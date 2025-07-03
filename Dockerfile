
# Stage 1: Build the SvelteKit app
FROM node:20-alpine AS builder

# ---- ADD THIS ----
# Declare VITE_API_URL as a build-time argument
ARG VITE_API_URL
# ------------------

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# ---- MODIFY THIS LINE ----
# Use the VITE_API_URL build argument during the build
# Add an echo to verify it's received in CI logs
RUN echo "Building with VITE_API_URL: ${VITE_API_URL}" && \
    VITE_API_URL=${VITE_API_URL} npm run build
# --------------------------

# Stage 2: Production image
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
# Install **only production dependencies**
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/build ./build
# Some adapters might need package.json at runtime too
COPY --from=builder /app/package.json ./package.json

# Set RUNTIME environment variables for the Node.js server
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
# Note: VITE_API_URL is NOT needed here, it's already baked into the JS bundle

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

CMD ["node", "build/index.js"]