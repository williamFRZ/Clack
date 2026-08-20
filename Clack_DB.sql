-- Garante que estamos usando o banco correto
CREATE DATABASE IF NOT EXISTS clack;
USE clack;

-- Remove as tabelas antigas para evitar erros de conflito (A ordem importa por causa das chaves)
DROP TABLE IF EXISTS logs_acesso;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS salas;

-- 1. Tabela de Usuários / Tags Cadastradas
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    uid_tag VARCHAR(50) NOT NULL UNIQUE,
    autorizado TINYINT(1) DEFAULT 1
);

-- 2. Tabela de Salas (Painel de Monitoramento)
CREATE TABLE salas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero_sala VARCHAR(50) NOT NULL,
    status ENUM('disponivel', 'em_uso', 'manutencao', 'erro') DEFAULT 'disponivel',
    usuario_nome VARCHAR(100) DEFAULT NULL
);

-- 3. Tabela de Logs (Histórico de Acessos)
CREATE TABLE logs_acesso (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sala_id INT NOT NULL,
    uid_tag VARCHAR(50) NOT NULL,
    mensagem VARCHAR(100) NOT NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
);

-- ========================================================
-- INSERINDO OS DADOS BASE PARA TESTES
-- ========================================================

-- Cadastrando as tags reais que você já testou na protoboard
INSERT INTO usuarios (nome, uid_tag, autorizado) VALUES 
('Vinicius Bittencourt', '49:00:51:A3', 1),
('William Meireles', '17:45:13:62', 1),
('Karine Dias', '77:A8:11:62', 1),
('Tag Bloqueada', 'AA:BB:CC:DD', 0);

-- Cadastrando as salas iniciais (Incluindo o Armário BRABOTS)
INSERT INTO salas (id, numero_sala, status, usuario_nome) VALUES 
(1, 'Sala 204', 'disponivel', NULL),
(2, 'Armário BRABOTS', 'disponivel', NULL),
(3, 'Sala 306', 'disponivel', NULL);