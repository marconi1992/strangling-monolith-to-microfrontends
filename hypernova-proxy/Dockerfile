FROM node:10-slim

WORKDIR /app

COPY  . .

RUN yarn install

RUN npm install pm2 -g 

ENV PORT=8080
ENV NODE_ENV=production

CMD [ "pm2-runtime", "src/index.js"]
