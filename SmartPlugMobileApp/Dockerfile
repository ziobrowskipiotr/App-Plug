FROM node:20-slim

WORKDIR /app


COPY package*.json ./
RUN npm ci

COPY . .

# Porty Expo
EXPOSE 8081 19000 19002

CMD ["npx", "expo", "start"]
