<?php
header('Content-Type: application/json');

$conexao = new mysqli("127.0.0.1", "root", "1234", "clack");

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Falha na conexão com o banco"]);
    exit;
}

// JOIN triplo: pega o log, o nome da sala e o nome do usuário correspondente à tag
$sql = "SELECT logs_acesso.*, salas.numero_sala, usuarios.nome 
        FROM logs_acesso 
        LEFT JOIN salas ON logs_acesso.sala_id = salas.id 
        LEFT JOIN usuarios ON logs_acesso.uid_tag = usuarios.uid_tag 
        ORDER BY data_hora DESC LIMIT 50";
        
$resultado = $conexao->query($sql);

$logs = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $logs[] = $row;
    }
}

echo json_encode($logs);
$conexao->close();
?>