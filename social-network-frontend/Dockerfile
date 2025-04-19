# Stage 1: Build
FROM node:22.14.0 AS builder

WORKDIR /social-network-frontend

# 1. Copy package files first for better layer caching
COPY package*.json ./

# 2. Install dependencies (including devDependencies for build)
RUN npm install

# 3. Copy all files (excluding those in .dockerignore)
COPY . .

# 4. Build the application with production environment
RUN npm run build

# Stage 2: Production
FROM node:22.14.0

WORKDIR /social-network-frontend

# 5. Set production environment
ENV NODE_ENV=production

# 6. Copy only necessary files from builder
COPY --from=builder /social-network-frontend/package*.json ./
COPY --from=builder /social-network-frontend/node_modules ./node_modules
COPY --from=builder /social-network-frontend/.next ./.next
COPY --from=builder /social-network-frontend/public ./public

# 7. Copy production environment file
COPY .env.production ./

# 8. Expose and run
EXPOSE 3000
CMD ["npm", "start"]