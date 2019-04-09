FROM php:7-fpm

RUN apt-get update &&\
    apt-get install -y git zip unzip &&\
    docker-php-ext-install mbstring pdo pdo_mysql

RUN scurl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

EXPOSE 8000

ENTRYPOINT [ "php", "artisan", "serve" , "--host", "0.0.0.0"]

