<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../conexao.php';
$versao = (int) $conexao->query('SELECT MAX(versao) versao FROM schema_versoes')->fetch_assoc()['versao'];
if ($versao < 3) { exit(1); }
$contexto = stream_context_create(['http' => ['ignore_errors' => true, 'timeout' => 3]]);
$resposta = file_get_contents('http://127.0.0.1/api.php?acao=sessao', false, $contexto);
exit($resposta !== false && preg_match('~^HTTP/\S+ 401 ~', $http_response_header[0] ?? '') ? 0 : 1);
