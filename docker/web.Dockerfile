# Map frontend: build the React app (web/), then serve the static files with nginx.

# --- Stage 1: build ---------------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app

# API URL baked into the bundle. Set here because web/.env is git-ignored,
# so a fresh clone does not have it (Vite reads VITE_* from the environment too).
ENV VITE_API_URL=http://localhost:8000

# Dependencies first, so this layer stays cached when only code changes.
COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./
RUN npm run build

# --- Stage 2: serve ---------------------------------------------------------
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
