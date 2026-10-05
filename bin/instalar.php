<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../conexao.php';
$conexao->multi_query(file_get_contents(__DIR__ . '/../sql/gestao.sql'));
do { if ($r = $conexao->store_result()) $r->free(); } while ($conexao->more_results() && $conexao->next_result());
echo "Estrutura de gestão instalada. Tabelas antigas preservadas; permissões não são importadas automaticamente.\n";
