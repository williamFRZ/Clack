<?php
require_once __DIR__ . '/api_common.php';
exigir_metodo('POST');
$sala_id = inteiro_positivo($_POST, 'sala_id');
$acao = $_POST['acao'] ?? null;
if (!in_array($acao, ['abrir', 'fechar'], true)) {
    resposta_json(['status' => 'erro', 'mensagem' => 'Acao invalida. Use abrir ou fechar.'], 400);
}
require __DIR__ . '/conexao.php';
$conexao->begin_transaction();
buscar_sala($conexao, $sala_id, true);
$novo_status = $acao === 'abrir' ? 'em_uso' : 'disponivel';
$nome_usuario = $acao === 'abrir' ? 'Portaria' : null;
$stmt = $conexao->prepare('UPDATE salas SET status = ?, usuario_nome = ? WHERE id = ?');
$stmt->bind_param('ssi', $novo_status, $nome_usuario, $sala_id);
$stmt->execute();
$stmt->close();
registrar_log($conexao, $sala_id, 'WEB-PORTARIA', $acao === 'abrir'
    ? 'Solicitou destravamento (Portaria)' : 'Solicitou travamento (Portaria)');
$conexao->commit();
resposta_json(['status' => 'sucesso', 'novo_status' => $novo_status,
    'mensagem' => 'Solicitacao registrada; sem confirmacao fisica da tranca.']);
