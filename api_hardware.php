<?php
require_once __DIR__ . '/api_common.php';
$metodo = $_SERVER['REQUEST_METHOD'] ?? '';
if ($metodo !== 'GET' && $metodo !== 'POST') {
    header('Allow: GET, POST');
    resposta_json(['status' => 'erro', 'mensagem' => 'Metodo nao permitido.'], 405);
}
$entrada = $metodo === 'GET' ? $_GET : $_POST;
$acao = $entrada['acao'] ?? null;
if (($metodo === 'GET' && $acao !== 'status') || ($metodo === 'POST' && $acao !== 'ler_tag')) {
    resposta_json(['status' => 'erro', 'mensagem' => 'Acao invalida.'], 400);
}
$sala_id = inteiro_positivo($entrada, 'sala');
if ($metodo === 'POST') {
    $uid = is_string($entrada['uid'] ?? null) ? strtoupper(trim($entrada['uid'])) : '';
    // MFRC522: UIDs de 4, 7 ou 10 bytes, em formato AA:BB:CC:DD.
    if (!preg_match('/^(?:[0-9A-F]{2}:){3}(?:[0-9A-F]{2}:){0,6}[0-9A-F]{2}$/D', $uid)
        || !in_array(strlen($uid), [11, 20, 29], true)) {
        resposta_json(['status' => 'erro', 'mensagem' => 'UID invalido.'], 400);
    }
}
require __DIR__ . '/conexao.php';
if ($metodo === 'GET') {
    $sala = buscar_sala($conexao, $sala_id);
    if (!in_array($sala['status'], ['disponivel', 'em_uso', 'manutencao'], true)) {
        resposta_json(['status' => 'erro', 'mensagem' => 'Estado da sala indisponivel.'], 409);
    }
    // Mantem o contrato de texto do firmware existente, com cabecalho correto.
    header('Content-Type: text/plain; charset=utf-8');
    echo $sala['status'] === 'disponivel' ? 'fechar' : 'abrir';
    exit;
}
$conexao->begin_transaction();
$sala = buscar_sala($conexao, $sala_id, true);
$stmt = $conexao->prepare('SELECT nome, autorizado FROM usuarios WHERE uid_tag = ?');
$stmt->bind_param('s', $uid);
$stmt->execute();
$usuario = $stmt->get_result()->fetch_assoc();
$stmt->close();
if (!$usuario || (int) $usuario['autorizado'] !== 1) {
    $msg = $usuario ? 'Acesso Negado (Tag Bloqueada)' : 'Acesso Negado (Tag Desconhecida)';
    registrar_log($conexao, $sala_id, $uid, $msg);
    $conexao->commit();
    resposta_json(['status' => 'erro', 'mensagem' => $msg], 403);
}
if (!in_array($sala['status'], ['disponivel', 'em_uso', 'manutencao'], true)) {
    $conexao->rollback();
    resposta_json(['status' => 'erro', 'mensagem' => 'Estado da sala indisponivel.'], 409);
}
// Regra LEGADA mantida nesta etapa. Perfis, permissoes por sala e transferencia
// de responsabilidade serao implementados juntos na proxima migracao.
$limpeza = stripos($usuario['nome'], 'limpeza') !== false;
$encerrar = $limpeza ? $sala['status'] === 'manutencao' : $sala['status'] !== 'disponivel';
$novo_status = $encerrar ? 'disponivel' : ($limpeza ? 'manutencao' : 'em_uso');
$nome = $encerrar ? null : $usuario['nome'];
$msg = $encerrar ? 'Encerrou o uso / Solicitou travamento' : ($limpeza ? 'Iniciou a limpeza' : 'Iniciou o uso');
$stmt = $conexao->prepare('UPDATE salas SET status = ?, usuario_nome = ? WHERE id = ?');
$stmt->bind_param('ssi', $novo_status, $nome, $sala_id);
$stmt->execute();
$stmt->close();
registrar_log($conexao, $sala_id, $uid, $msg);
$conexao->commit();
resposta_json(['status' => 'sucesso', 'mensagem' => $msg, 'novo_status' => $novo_status]);
