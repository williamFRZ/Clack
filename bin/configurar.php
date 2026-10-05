<?php
// Configuração inicial e atualização idempotente do servidor Clack.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../conexao.php';

[$script, $login, $nome] = array_pad($argv, 3, '');
$login = trim($login);
$nome = trim($nome);

function executar_arquivo_sql(mysqli $db, string $arquivo): void
{
    $sql = file_get_contents($arquivo);
    if ($sql === false) {
        throw new RuntimeException('Não foi possível ler ' . $arquivo);
    }

    $db->multi_query($sql);
    do {
        if ($resultado = $db->store_result()) {
            $resultado->free();
        }
    } while ($db->more_results() && $db->next_result());
}

echo "Clack — configuração do servidor\n";
echo "Banco conectado: " . $conexao->query('SELECT DATABASE() banco')->fetch_assoc()['banco'] . "\n";

// Impede duas instalações simultâneas no mesmo banco.
$bloqueio = $conexao->query("SELECT GET_LOCK('clack_configuracao', 10) adquirido")->fetch_assoc();
if ((int) $bloqueio['adquirido'] !== 1) {
    throw new RuntimeException('Outra configuração do Clack já está em andamento.');
}

try {
    executar_arquivo_sql($conexao, __DIR__ . '/../sql/gestao.sql');

    // Versão 3: coordenadas relativas à planta, sem reaproveitar posições do
    // antigo mapa esquemático, e TI separada do perfil de acesso completo.
    foreach (['mapa_x', 'mapa_y'] as $coluna) {
        $stmt = $conexao->prepare("SELECT COUNT(*) total FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ambientes' AND COLUMN_NAME = ?");
        $stmt->execute([$coluna]);
        if ((int) $stmt->get_result()->fetch_assoc()['total'] === 0) {
            $conexao->query("ALTER TABLE ambientes ADD COLUMN {$coluna} DECIMAL(6,3) NULL");
            echo "Migração: coluna {$coluna} adicionada.\n";
        }
    }
    $perfil = $conexao->query("SELECT COLUMN_TYPE FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cartoes' AND COLUMN_NAME = 'perfil'")->fetch_assoc();
    if (!str_contains($perfil['COLUMN_TYPE'], "'ti'")) {
        $conexao->query("ALTER TABLE cartoes MODIFY COLUMN perfil ENUM('professor','aluno','limpeza','completo','ti') NOT NULL");
        echo "Migração: perfil TI adicionado.\n";
    }

    // Compatibilidade não destrutiva com o banco original do TCC I.
    $legado = $conexao->query("SELECT COUNT(*) total FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'")->fetch_assoc();
    if ((int) $legado['total'] === 1) {
        $resultado = $conexao->query("SELECT COUNT(*) total FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'matricula'");
        if ((int) $resultado->fetch_assoc()['total'] === 0) {
            $conexao->query('ALTER TABLE usuarios ADD COLUMN matricula VARCHAR(50) DEFAULT NULL AFTER nome');
            echo "Migração: coluna matricula adicionada à tabela antiga.\n";
        }
    }

    $stmt = $conexao->prepare('INSERT IGNORE INTO schema_versoes (versao) VALUES (?)');
    $versao = 3;
    $stmt->bind_param('i', $versao);
    $stmt->execute();

    $totalOperadores = (int) $conexao->query('SELECT COUNT(*) total FROM operadores')->fetch_assoc()['total'];
    if ($totalOperadores === 0) {
        if ($login === '' || $nome === '') {
            fwrite(STDERR, "\nAinda não existe administrador.\n");
            fwrite(STDERR, "Uso: php bin/configurar.php login \"Nome completo\"\n");
            exit(2);
        }
        if (!preg_match('/^[a-zA-Z0-9._-]{3,50}$/D', $login)) {
            throw new InvalidArgumentException('O login deve ter 3 a 50 caracteres: letras, números, ponto, hífen ou sublinhado.');
        }
        if (strlen($nome) > 100) {
            throw new InvalidArgumentException('O nome deve ter no máximo 100 caracteres.');
        }

        fwrite(STDERR, "Senha inicial (12 a 72 bytes; a digitação aparece no terminal): ");
        $senha = rtrim((string) fgets(STDIN), "\r\n");
        if (strlen($senha) < 12 || strlen($senha) > 72) {
            throw new InvalidArgumentException('A senha deve ter entre 12 e 72 bytes.');
        }

        $hash = password_hash($senha, PASSWORD_DEFAULT);
        $stmt = $conexao->prepare("INSERT INTO operadores (nome, login, senha, papel) VALUES (?, ?, ?, 'admin')");
        $stmt->bind_param('sss', $nome, $login, $hash);
        $stmt->execute();
        echo "Administrador criado: {$login}\n";
    } else {
        echo "Operadores preservados: {$totalOperadores}. Nenhuma senha foi alterada.\n";
    }

    echo "Banco atualizado para a versão 3.\n";
    echo "Abra /painel/ no endereço do servidor e faça login.\n";
} finally {
    $conexao->query("SELECT RELEASE_LOCK('clack_configuracao')");
}
