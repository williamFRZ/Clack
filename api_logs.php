<?php
header('Content-Type: application/json');

// Conexão com o banco de dados
$conexao = new mysqli("127.0.0.1", "root", "1234", "clack");

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Falha na conexão com o banco"]);
    exit;
}

// Busca os logs fazendo LEFT JOIN com salas e usuarios para resgatar nome e matrícula
$sql = "SELECT l.*, s.numero_sala, u.nome, u.matricula 
        FROM logs_acesso l 
        LEFT JOIN salas s ON l.sala_id = s.id 
        LEFT JOIN usuarios u ON l.uid_tag = u.uid_tag 
        ORDER BY l.data_hora DESC 
        LIMIT 50";

$resultado = $conexao->query($sql);
$logs = [];

if ($resultado) {
    while ($row = $resultado->fetch_assoc()) {
        $logs[] = $row;
    }
}

echo json_encode($logs);

$conexao->close();
?>