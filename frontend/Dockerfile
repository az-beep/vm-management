FROM node:18

WORKDIR /app
COPY . .
RUN npm install -g serve

CMD ["serve", "-s", ".", "-l", "3000"]
