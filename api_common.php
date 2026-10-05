<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');

function resposta_json(array $dados, int $codigo = 200): void
{
    http_response_code($codigo);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

set_exception_handler(function (Throwable $erro): void {
    global $conexao;
    if (isset($conexao) && $conexao instanceof mysqli) {
        try { $conexao->rollback(); } catch (Throwable $ignorado) {}
    }
    error_log('[Clack] ' . $erro->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => 'erro', 'mensagem' => 'Falha interna. Confira o log do servidor.']);
});

function exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        resposta_json(['status' => 'erro', 'mensagem' => 'Metodo nao permitido.'], 405);
    }
}

function inteiro_positivo(array $origem, string $campo): int
{
    $valor = $origem[$campo] ?? null;
    $id = is_scalar($valor) ? filter_var($valor, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]) : false;
    if ($id === false || $id === null) {
        resposta_json(['status' => 'erro', 'mensagem' => 'Identificador de sala invalido.'], 400);
    }
    return $id;
}

function buscar_sala(mysqli $db, int $id, bool $bloquear = false): array
{
    $sql = 'SELECT id, status, usuario_nome FROM salas WHERE id = ?' . ($bloquear ? ' FOR UPDATE' : '');
    $stmt = $db->prepare($sql);
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $sala = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$sala) {
        if ($bloquear) { $db->rollback(); }
        resposta_json(['status' => 'erro', 'mensagem' => 'Sala nao encontrada.'], 404);
    }
    return $sala;
}

function registrar_log(mysqli $db, int $sala, string $uid, string $mensagem): void
{
    $stmt = $db->prepare('INSERT INTO logs_acesso (sala_id, uid_tag, mensagem) VALUES (?, ?, ?)');
    $stmt->bind_param('iss', $sala, $uid, $mensagem);
    $stmt->execute();
    $stmt->close();
}
