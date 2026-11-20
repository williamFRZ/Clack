<?php
// Usado pelo iniciador para não solicitar criação de conta em cada abertura.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(1); }
require __DIR__ . '/../conexao.php';
$total = (int) $conexao->query('SELECT COUNT(*) total FROM operadores')->fetch_assoc()['total'];
exit($total > 0 ? 0 : 2);
