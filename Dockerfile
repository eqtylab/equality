# Stage 1: Build the React app
FROM node:24.0.2-slim AS build

# Set working directory to app
WORKDIR /app

# Enable pnpm
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Copy only the package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy each workspace package.json
COPY packages/ui/package.json packages/ui/
COPY packages/demo/package.json packages/demo/

# Install dependencies
RUN pnpm install

# Copy all project contents to app directory
COPY . .

# Build the application
RUN pnpm build

# Stage 2: Serve with Nginx + runtime config
FROM nginx:alpine

# Copy built output to Nginx HTML directory
COPY --from=build /app/packages/demo/dist /usr/share/nginx/html

# Copy custom nginx config (recommended)
COPY /nginx/nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
