<?php
header('Content-Type: application/json');

// Conexão apontando para o banco 'clack' novo com sua senha '1234'
$conexao = new mysqli("127.0.0.1", "root", "1234", "clack");

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["erro" => "Falha na conexão com o banco"]);
    exit;
}

$sql = "SELECT * FROM salas";
$resultado = $conexao->query($sql);

$salas = [];
if ($resultado->num_rows > 0) {
    while($row = $resultado->fetch_assoc()) {
        $salas[] = $row;
    }
}

echo json_encode($salas);
$conexao->close();
?>