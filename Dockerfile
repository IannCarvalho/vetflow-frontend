# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build
RUN npm run build

# Stage 2: Runtime com Nginx
FROM node:20-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Instalar serve para servir a aplicação
RUN npm install -g serve

EXPOSE 3039

CMD ["serve", "-s", "dist", "-l", "3039"]
