FROM node:20-alpine AS builder

WORKDIR /app

# Herramientas necesarias para compilar bcrypt (modulo nativo)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3002
ENV NODE_ENV=production
CMD ["node", "index.js"]
