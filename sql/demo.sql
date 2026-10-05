-- SOMENTE em banco vazio de testes; nunca sobrescreve dados existentes.
USE clack;
INSERT INTO salas (id, numero_sala) VALUES (1, 'Sala de teste');
-- Troque o UID ficticio pelo UID lido no Monitor Serial para testar seu cartao.
INSERT INTO usuarios (nome, matricula, uid_tag, autorizado)
VALUES ('Usuario de teste', NULL, '01:02:03:04', 1);
