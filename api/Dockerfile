FROM node:24@sha256:14078204b6bb268c107ceff6d3c43f45a888105e5c2b18b14c32b3409d93a1b0
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY productos.json ./
COPY src ./src
RUN mkdir datos && chown node:node datos
USER node
EXPOSE 3000
CMD ["node", "src/servidor.js"]
