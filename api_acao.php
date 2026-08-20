<?php
header('Content-Type: application/json');

$conexao = new mysqli("127.0.0.1", "root", "1234", "clack");

if ($conexao->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "erro", "mensagem" => "Falha na conexão"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $sala_id = intval($_POST['sala_id']);
    $acao = $_POST['acao']; // 'abrir' ou 'fechar'

    if ($acao == 'abrir') {
        $novo_status = 'em_uso';
        $msg_log = "Acessou o ambiente (Portaria)";
        $nome_usuario = "Portaria";

        $update = "UPDATE salas SET status = 'em_uso', usuario_nome = ? WHERE id = ?";
        $stmt_up = $conexao->prepare($update);
        $stmt_up->bind_param("si", $nome_usuario, $sala_id);
    } else {
        $novo_status = 'disponivel';
        $msg_log = "Trancou o ambiente (Portaria)";

        $update = "UPDATE salas SET status = 'disponivel', usuario_nome = NULL WHERE id = ?";
        $stmt_up = $conexao->prepare($update);
        $stmt_up->bind_param("i", $sala_id);
    }
    
    $stmt_up->execute();
    $stmt_up->close();

    // Registra na tabela de logs usando uma tag fictícia de controle da Portaria
    $uid_portaria = "WEB-PORTARIA";
    $log = "INSERT INTO logs_acesso (sala_id, uid_tag, mensagem) VALUES (?, ?, ?)";
    $stmt_log = $conexao->prepare($log);
    $stmt_log->bind_param("iss", $sala_id, $uid_portaria, $msg_log);
    $stmt_log->execute();
    $stmt_log->close();

    echo json_encode(["status" => "sucesso", "novo_status" => $novo_status]);
}

$conexao->close();
?>