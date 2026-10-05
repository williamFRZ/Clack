FROM node:22-bookworm-slim AS painel
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM php:8.2-apache-bookworm
RUN docker-php-ext-install mysqli \
    && mkdir -p /opt/clack /var/lib/php/sessions \
    && chown www-data:www-data /var/lib/php/sessions
WORKDIR /opt/clack
COPY api.php api_common.php conexao.php dispositivo.php api_hardware.php api_acao.php api_salas.php api_logs.php ./
COPY app/ app/
COPY bin/ bin/
COPY sql/ sql/
COPY config/config.docker.php config/config.docker.php
COPY docker/entrypoint.sh /usr/local/bin/clack-entrypoint
COPY docker/php.ini /usr/local/etc/php/conf.d/clack.ini
COPY docker/apache.conf /etc/apache2/conf-enabled/clack.conf
COPY index.html /var/www/html/index.html
COPY --from=painel /painel/ /var/www/html/painel/
# Only these wrappers and the compiled panel are reachable over HTTP.
RUN for endpoint in api dispositivo api_hardware api_acao api_salas api_logs; do \
      printf '<?php require "/opt/clack/%s.php";\n' "$endpoint" > "/var/www/html/$endpoint.php"; \
    done
ENTRYPOINT ["sh", "/usr/local/bin/clack-entrypoint"]
CMD ["apache2-foreground"]
