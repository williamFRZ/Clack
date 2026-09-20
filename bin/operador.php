<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../conexao.php';
[$script, $login, $nome] = array_pad($argv, 3, '');
if (!$login || !$nome) exit("Uso: php bin/operador.php login 'Nome completo' (senha lida da entrada padrão)\n");
fwrite(STDERR, "Senha (12 a 72 bytes; entrada visível): ");
$senha = rtrim(fgets(STDIN), "\r\n");
if (strlen($senha) < 12 || strlen($senha) > 72) exit("Senha inválida.\n");
$stmt = $conexao->prepare("INSERT INTO operadores(nome,login,senha,papel) VALUES(?,?,?,'admin')");
$stmt->execute([$nome, $login, password_hash($senha, PASSWORD_DEFAULT)]);
echo "Administrador criado.\n";
