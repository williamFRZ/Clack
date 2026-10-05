<?php
// Credentials are injected by Compose; config.local.php is never copied into the image.
return [
    'db_host' => getenv('CLACK_DB_HOST') ?: 'db',
    'db_port' => 3306,
    'db_name' => getenv('CLACK_DB_NAME') ?: 'clack',
    'db_user' => getenv('CLACK_DB_USER') ?: 'clack_app',
    'db_password' => getenv('CLACK_DB_PASSWORD') ?: '',
];
