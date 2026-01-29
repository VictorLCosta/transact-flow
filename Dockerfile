# =========================
# Etapa 1: Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


# =========================
# Etapa 2: Runtime
# =========================
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY ecosystem.config.json ./

EXPOSE 3000

CMD ["pm2-runtime", "ecosystem.config.json", "--env", "production"]
