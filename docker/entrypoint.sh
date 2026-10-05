#!/bin/sh
set -eu
if [ "$1" = "apache2-foreground" ]; then
    status=0
    php bin/configurar.php || status=$?
    # Exit 2 means the schema is ready, but the first admin must be created by CLI.
    if [ "$status" -ne 0 ] && [ "$status" -ne 2 ]; then
        exit "$status"
    fi
fi
exec docker-php-entrypoint "$@"
