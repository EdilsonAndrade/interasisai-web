# Usa a imagem oficial do Node.js
FROM node:20-alpine AS base

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia todo o código-fonte da aplicação
COPY . .

# Desativa a coleta de telemetria do Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Compila o projeto Next.js para produção
RUN npm run build

# Expõe a porta interna 3001
EXPOSE 3001

# Inicia a aplicação na porta 3001
ENV PORT 3001
CMD ["npm", "start"]