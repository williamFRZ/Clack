-- SOMENTE no banco descartável de testes: reproduz as tabelas da versão 2.
USE clack;
CREATE TABLE schema_versoes (versao INT PRIMARY KEY, aplicada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB;
INSERT INTO schema_versoes (versao) VALUES (2);
CREATE TABLE cartoes (
 id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(100) NOT NULL, matricula VARCHAR(50), externo BOOLEAN NOT NULL DEFAULT 0,
 uid VARCHAR(32) UNIQUE, perfil ENUM('professor','aluno','limpeza','completo') NOT NULL, ativo BOOLEAN NOT NULL DEFAULT 1
) ENGINE=InnoDB;
CREATE TABLE ambientes (
 id INT AUTO_INCREMENT PRIMARY KEY, nome VARCHAR(50) NOT NULL, andar VARCHAR(50) NOT NULL DEFAULT 'Térreo',
 categoria ENUM('aula','administrativa','outra') NOT NULL DEFAULT 'aula', x INT NOT NULL DEFAULT 0, y INT NOT NULL DEFAULT 0,
 estado ENUM('disponivel','em_uso','manutencao','erro') NOT NULL DEFAULT 'disponivel', responsavel INT NULL,
 FOREIGN KEY (responsavel) REFERENCES cartoes(id)
) ENGINE=InnoDB;
INSERT INTO ambientes (nome,andar,x,y) VALUES ('Persistida','Térreo',321,456);
