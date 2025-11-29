FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --maxsockets 5 || npm install --legacy-peer-deps --maxsockets 5

COPY . .

RUN npm run build

EXPOSE 3005
CMD ["npm", "run", "start:prod"]
