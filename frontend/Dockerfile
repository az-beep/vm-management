FROM node:18-alpine

# Устанавливаем live-server глобально
RUN npm install -g live-server

WORKDIR /app
COPY . .

EXPOSE 3000

# Запускаем live-server с правильным путем
CMD ["live-server", "--port=3000", "--host=0.0.0.0", "--open=/html/login.html"]