# Тот же образ Node.js
FROM node:18

# Рабочая директория
WORKDIR /app

# Копируем и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем код сервера
COPY . .

# Копируем файл с товарами
COPY ../data /data

# Переменная окружения для пути к файлу
ENV DATA_FILE=/data/products.json

# Открываем порт сервера
EXPOSE 8080

# Команда запуска
CMD ["node", "server.js"]