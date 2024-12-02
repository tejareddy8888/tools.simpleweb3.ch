FROM node:20 AS builder
WORKDIR /app
COPY ./package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview"]