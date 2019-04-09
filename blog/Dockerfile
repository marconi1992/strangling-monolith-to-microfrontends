FROM php:7-fpm

WORKDIR /app

VOLUME [ "/app/public" ]

COPY . .

RUN docker-php-ext-install mbstring pdo pdo_mysql

RUN apt-get update && \
    apt-get install -y git zip unzip && \
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

RUN chown -R $USER:www-data storage && \
    chown -R $USER:www-data bootstrap/cache && \
    chmod -R 775 storage && \
    chmod -R 775 bootstrap/cache

RUN composer install

EXPOSE 8000

ENTRYPOINT [ "php", "artisan", "serve" , "--host", "0.0.0.0"]
