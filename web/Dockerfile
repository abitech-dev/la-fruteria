FROM node:24@sha256:14078204b6bb268c107ceff6d3c43f45a888105e5c2b18b14c32b3409d93a1b0
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["node_modules/.bin/vite", "preview", "--host", "0.0.0.0"]
