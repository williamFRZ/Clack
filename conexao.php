<?php
$host = 'localhost';
$usuario = 'root';
$senha = '1234';
$banco = 'Clack_DB';

$conn = new mysqli($host, $usuario, $senha, $banco);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    die(json_encode(["erro" => "Falha na conexao: " . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");
?>