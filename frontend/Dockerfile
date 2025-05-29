# Используем легкий веб-сервер
FROM nginx:alpine

# Удаляем стандартную страницу nginx
RUN rm -rf /usr/share/nginx/html/*

# Копируем наши HTML/JS файлы в контейнер
COPY . /usr/share/nginx/html

# Nginx автоматически запускается на порту 80