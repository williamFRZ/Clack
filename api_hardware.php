<?php
// Configuração do cabeçalho para aceitar requisições da ESP32
header('Content-Type: application/json');

// Conexão com o banco de dados
$conexao = new mysqli("127.0.0.1", "root", "1234", "clack");

if ($conexao->connect_error) {
    die(json_encode(["status" => "erro", "mensagem" => "Falha na conexao com o banco"]));
}

// =======================================================================
// TAREFA 1: RESPONDER AO POLLING DO SERVO MOTOR (GET)
// =======================================================================
if ($_SERVER['REQUEST_METHOD'] == 'GET' && isset($_GET['acao']) && $_GET['acao'] == 'status') {
    $sala_id = intval($_GET['sala']);
    
    $sql = "SELECT status FROM salas WHERE id = ?";
    $stmt = $conexao->prepare($sql);
    $stmt->bind_param("i", $sala_id);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows > 0) {
        $sala = $resultado->fetch_assoc();
        // Se a sala estiver "em_uso" OU "manutencao", a tranca deve estar aberta
        if ($sala['status'] == 'em_uso' || $sala['status'] == 'manutencao') {
            echo "abrir";
        } else {
            echo "fechar";
        }
    } else {
        echo "erro";
    }
    $stmt->close();
    exit;
}

// =======================================================================
// TAREFA 2: PROCESSAR A LEITURA DA TAG E REGISTRAR O LOG (POST)
// =======================================================================
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['acao']) && $_POST['acao'] == 'ler_tag') {
    $sala_id = intval($_POST['sala']);
    $uid = $_POST['uid'];

    // 1. Verifica se a tag existe e está autorizada
    $sql_user = "SELECT * FROM usuarios WHERE uid_tag = ?";
    $stmt = $conexao->prepare($sql_user);
    $stmt->bind_param("s", $uid);
    $stmt->execute();
    $res_user = $stmt->get_result();

    if ($res_user->num_rows > 0) {
        $usuario = $res_user->fetch_assoc();
        $nome_usuario = $usuario['nome'];

        if ($usuario['autorizado'] == 1) {
            
            // Verifica se o usuário é da limpeza
            $eh_limpeza = (stripos($nome_usuario, 'limpeza') !== false);

            // Busca o status atual da sala
            $sql_sala = "SELECT status FROM salas WHERE id = ?";
            $stmt_sala = $conexao->prepare($sql_sala);
            $stmt_sala->bind_param("i", $sala_id);
            $stmt_sala->execute();
            $sala_atual = $stmt_sala->get_result()->fetch_assoc();
            $stmt_sala->close();

            // Lógica para Limpeza
            if ($eh_limpeza) {
                if ($sala_atual['status'] == 'manutencao') {
                    $msg_log = "Finalizou a limpeza / Trancou o ambiente";
                    $update = "UPDATE salas SET status = 'disponivel', usuario_nome = NULL WHERE id = ?";
                    $stmt_up = $conexao->prepare($update);
                    $stmt_up->bind_param("i", $sala_id);
                } else {
                    $msg_log = "Iniciou a limpeza (Manutencao)";
                    $update = "UPDATE salas SET status = 'manutencao', usuario_nome = ? WHERE id = ?";
                    $stmt_up = $conexao->prepare($update);
                    $stmt_up->bind_param("si", $nome_usuario, $sala_id);
                }
            } 
            // Lógica para Usuários Comuns (Professores/Alunos)
            else {
                if ($sala_atual['status'] == 'disponivel') {
                    $msg_log = "Acessou o ambiente";
                    $update = "UPDATE salas SET status = 'em_uso', usuario_nome = ? WHERE id = ?";
                    $stmt_up = $conexao->prepare($update);
                    $stmt_up->bind_param("si", $nome_usuario, $sala_id);
                } else {
                    $msg_log = "Trancou o ambiente";
                    $update = "UPDATE salas SET status = 'disponivel', usuario_nome = NULL WHERE id = ?";
                    $stmt_up = $conexao->prepare($update);
                    $stmt_up->bind_param("i", $sala_id);
                }
            }

            $stmt_up->execute();
            $stmt_up->close();

            // 3. Registra o evento de sucesso na tabela de logs
            $log = "INSERT INTO logs_acesso (sala_id, uid_tag, mensagem) VALUES (?, ?, ?)";
            $stmt_log = $conexao->prepare($log);
            $stmt_log->bind_param("iss", $sala_id, $uid, $msg_log);
            $stmt_log->execute();

            echo json_encode(["status" => "sucesso", "mensagem" => "Responsável: $nome_usuario"]);
        } else {
            // Tag bloqueada
            $msg_log = "Acesso Negado (Tag Bloqueada)";
            $log = "INSERT INTO logs_acesso (sala_id, uid_tag, mensagem) VALUES (?, ?, ?)";
            $stmt_log = $conexao->prepare($log);
            $stmt_log->bind_param("iss", $sala_id, $uid, $msg_log);
            $stmt_log->execute();

            echo json_encode(["status" => "erro", "mensagem" => "Acesso Bloqueado!"]);
        }
    } else {
        // Tag não cadastrada
        $msg_log = "Acesso Negado (Tag Desconhecida)";
        $log = "INSERT INTO logs_acesso (sala_id, uid_tag, mensagem) VALUES (?, ?, ?)";
        $stmt_log = $conexao->prepare($log);
        $stmt_log->bind_param("iss", $sala_id, $uid, $msg_log);
        $stmt_log->execute();

        echo json_encode(["status" => "erro", "mensagem" => "Tag nao reconhecida!"]);
    }
    
    $conexao->close();
}
?>