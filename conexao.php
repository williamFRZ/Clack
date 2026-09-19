<?php
require_once __DIR__ . '/api_common.php';
$configPath = __DIR__ . '/config/config.local.php';
if (!is_file($configPath)) {
    resposta_json(['status' => 'erro', 'mensagem' => 'Configure config/config.local.php conforme o README.'], 503);
}
$config = require $configPath;
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$conexao = new mysqli(
    $config['db_host'], $config['db_user'], $config['db_password'],
    $config['db_name'], (int) ($config['db_port'] ?? 3306)
);
$conexao->set_charset('utf8mb4');
// Datas retornadas pela API usam UTC; o navegador apresenta no horario local.
$conexao->query("SET time_zone = '+00:00'");
