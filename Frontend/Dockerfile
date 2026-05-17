# Usar directamente la imagen Node para servir en modo dev
FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install --legacy-peer-deps

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 5173

# Ejecutar Vite dev server (accesible desde fuera del contenedor)
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
