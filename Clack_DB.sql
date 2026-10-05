-- Garante que estamos usando o banco correto
CREATE DATABASE IF NOT EXISTS clack CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clack;

-- Instalacao nao destrutiva. Para bancos existentes, execute sql/migrate.php.

-- 1. Tabela de Usuários / Tags Cadastradas
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    matricula VARCHAR(50) DEFAULT NULL,
    uid_tag VARCHAR(50) NOT NULL UNIQUE,
    autorizado TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Salas (Painel de Monitoramento)
CREATE TABLE IF NOT EXISTS salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_sala VARCHAR(50) NOT NULL,
    status ENUM('disponivel', 'em_uso', 'manutencao', 'erro') DEFAULT 'disponivel',
    usuario_nome VARCHAR(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Logs (Histórico de Acessos)
CREATE TABLE IF NOT EXISTS logs_acesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    uid_tag VARCHAR(50) NOT NULL,
    mensagem VARCHAR(100) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
