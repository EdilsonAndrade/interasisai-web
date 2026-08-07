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

ARG NEXT_PUBLIC_PYTHON_BACKEND_URL
ARG NEXT_PUBLIC_TENANT_ID
ARG NEXT_PUBLIC_ENABLE_AUDIO

ENV NEXT_PUBLIC_PYTHON_BACKEND_URL=$NEXT_PUBLIC_PYTHON_BACKEND_URL
ENV NEXT_PUBLIC_TENANT_ID=$NEXT_PUBLIC_TENANT_ID
ENV NEXT_PUBLIC_ENABLE_AUDIO=$NEXT_PUBLIC_ENABLE_AUDIO

# Compila o projeto Next.js para produção
RUN npm run build

# Expõe a porta interna 3001
EXPOSE 3001

# Inicia a aplicação na porta 3001
ENV PORT 3001
CMD ["npm", "start"]