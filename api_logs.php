<?php
require_once __DIR__ . '/api_common.php';
exigir_metodo('GET');
require __DIR__ . '/conexao.php';
$resultado = $conexao->query("SELECT l.id, l.sala_id, l.uid_tag, l.mensagem,
    DATE_FORMAT(l.data_hora, '%Y-%m-%dT%H:%i:%sZ') AS data_hora,
    s.numero_sala, u.nome, u.matricula
    FROM logs_acesso l
    LEFT JOIN salas s ON l.sala_id = s.id
    LEFT JOIN usuarios u ON l.uid_tag = u.uid_tag
    ORDER BY l.data_hora DESC, l.id DESC LIMIT 50");
echo json_encode($resultado->fetch_all(MYSQLI_ASSOC), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
