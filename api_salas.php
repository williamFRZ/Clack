<?php
require_once __DIR__ . '/api_common.php';
exigir_metodo('GET');
require __DIR__ . '/conexao.php';
$resultado = $conexao->query('SELECT id, numero_sala, status, usuario_nome FROM salas ORDER BY id');
echo json_encode($resultado->fetch_all(MYSQLI_ASSOC), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
