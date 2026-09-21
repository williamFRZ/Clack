CREATE TABLE IF NOT EXISTS operadores (
 id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100) NOT NULL, login VARCHAR(100) NOT NULL UNIQUE,
 senha VARCHAR(255) NOT NULL, papel ENUM('admin','portaria') NOT NULL DEFAULT 'portaria', ativo BOOLEAN NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS cartoes (
 id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100) NOT NULL, matricula VARCHAR(50), externo BOOLEAN NOT NULL DEFAULT 0,
 uid VARCHAR(32) UNIQUE, perfil ENUM('professor','aluno','limpeza','completo') NOT NULL, ativo BOOLEAN NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS ambientes (
 id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(50) NOT NULL, andar VARCHAR(50) NOT NULL DEFAULT 'Térreo',
 categoria ENUM('aula','administrativa','outra') NOT NULL DEFAULT 'aula', x INT NOT NULL DEFAULT 0, y INT NOT NULL DEFAULT 0,
 estado ENUM('disponivel','em_uso','manutencao','erro') NOT NULL DEFAULT 'disponivel', responsavel INT NULL,
 FOREIGN KEY (responsavel) REFERENCES cartoes(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS permissoes (
 cartao_id INT NOT NULL, ambiente_id INT NOT NULL, PRIMARY KEY(cartao_id,ambiente_id),
 FOREIGN KEY(cartao_id) REFERENCES cartoes(id), FOREIGN KEY(ambiente_id) REFERENCES ambientes(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS dispositivos (
 id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100) NOT NULL, tipo ENUM('tranca','cadastrador') NOT NULL,
 ambiente_id INT UNIQUE NULL, token_hash CHAR(64) NOT NULL, ativo BOOLEAN NOT NULL DEFAULT 1,
 ultima_conexao DATETIME NULL, ultima_sequencia BIGINT NOT NULL DEFAULT 0, versao VARCHAR(64) NULL,
 FOREIGN KEY(ambiente_id) REFERENCES ambientes(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS eventos (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, dispositivo_id INT NOT NULL, sequencia BIGINT NOT NULL,
 ambiente_id INT NOT NULL, uid VARCHAR(32), nome VARCHAR(100), perfil VARCHAR(20), resultado VARCHAR(60) NOT NULL,
 ocorrido_em DATETIME NULL, recebido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(dispositivo_id,sequencia), FOREIGN KEY(dispositivo_id) REFERENCES dispositivos(id), FOREIGN KEY(ambiente_id) REFERENCES ambientes(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS comandos (
 id INT AUTO_INCREMENT PRIMARY KEY, dispositivo_id INT NOT NULL, operador_id INT NOT NULL,
 acao ENUM('abrir','fechar','manutencao','liberar') NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 expira_em DATETIME NOT NULL, confirmado_em DATETIME NULL,
 FOREIGN KEY(dispositivo_id) REFERENCES dispositivos(id), FOREIGN KEY(operador_id) REFERENCES operadores(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS capturas (
 id CHAR(32) PRIMARY KEY, operador_id INT NOT NULL, dispositivo_id INT NOT NULL, uid VARCHAR(32) NULL,
 expira_em DATETIME NOT NULL, consumida BOOLEAN NOT NULL DEFAULT 0,
 FOREIGN KEY(operador_id) REFERENCES operadores(id), FOREIGN KEY(dispositivo_id) REFERENCES dispositivos(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS auditoria (
 id BIGINT AUTO_INCREMENT PRIMARY KEY, operador_id INT NOT NULL, acao VARCHAR(80) NOT NULL,
 detalhes JSON NOT NULL, criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(operador_id) REFERENCES operadores(id)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS tentativas_login (
 chave CHAR(64) PRIMARY KEY, quantidade INT NOT NULL DEFAULT 0, inicio DATETIME NOT NULL
) ENGINE=InnoDB;
