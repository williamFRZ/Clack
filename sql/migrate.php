<?php
// Executar somente no terminal: php sql/migrate.php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../conexao.php';
$resultado = $conexao->query("SELECT COUNT(*) AS total FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'matricula'");
if ((int) $resultado->fetch_assoc()['total'] === 0) {
    $conexao->query('ALTER TABLE usuarios ADD COLUMN matricula VARCHAR(50) DEFAULT NULL AFTER nome');
    echo "Coluna matricula adicionada.\n";
} else {
    echo "Coluna matricula ja existe; nenhuma alteracao.\n";
}
echo "Migracao concluida sem excluir usuarios, salas ou logs.\n";
