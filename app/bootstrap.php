<?php
require_once __DIR__ . '/../conexao.php';
function q(string $sql, array $args = []): mysqli_stmt {
 global $conexao; $s = $conexao->prepare($sql); $s->execute($args); return $s;
}
function rows(string $sql, array $args = []): array { return q($sql,$args)->get_result()->fetch_all(MYSQLI_ASSOC); }
function one(string $sql, array $args = []): ?array { return rows($sql,$args)[0] ?? null; }
function fail(string $message, int $status = 400): never { resposta_json(['mensagem'=>$message],$status); }
function body(): array {
 if(strtolower(trim(explode(';',$_SERVER['CONTENT_TYPE']??'')[0]))!=='application/json') fail('Use Content-Type application/json.',415);
 if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0)>65536) fail('Pedido muito grande.',413);
 try { $data = json_decode(file_get_contents('php://input'),true,64,JSON_THROW_ON_ERROR); }
 catch (JsonException $e) { fail('JSON inválido.'); }
 if (!is_array($data) || array_is_list($data) && $data) fail('Objeto JSON esperado.');
 return $data;
}
function txt(array $data,string $key,int $max=100): string {
 $s=$data[$key]??null; if(!is_string($s)||trim($s)===''||strlen($s)>$max) fail('Campo inválido: '.$key);
 return trim($s);
}
function choice(array $data,string $key,array $choices): string {
 $s=txt($data,$key); if(!in_array($s,$choices,true)) fail('Valor inválido: '.$key); return $s;
}
function id(array $data,string $key='id'): int { return inteiro_positivo($data,$key); }
function audit(array $op,string $action,array $details): void {
 q('INSERT INTO auditoria(operador_id,acao,detalhes) VALUES(?,?,?)',[$op['id'],$action,json_encode($details,JSON_THROW_ON_ERROR)]);
}
function start_session(): void {
 session_set_cookie_params(['httponly'=>true,'samesite'=>'Strict','secure'=>!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off','path'=>'/']);
 ini_set('session.use_strict_mode','1'); session_start();
}
function operator(bool $admin=false): array {
 $op=one('SELECT id,nome,login,papel,senha FROM operadores WHERE id=? AND ativo=1',[$_SESSION['op']??0]);
 if(!$op || !hash_equals(hash('sha256',$op['senha']),$_SESSION['auth']??'') || time()-($_SESSION['last']??0)>1800) { session_destroy(); fail('Entre com sua conta da portaria.',401); }
 unset($op['senha']); $_SESSION['last']=time();
 if($admin && $op['papel']!=='admin') fail('Acesso exclusivo do administrador.',403);
 if($_SERVER['REQUEST_METHOD']!=='GET' && !hash_equals($_SESSION['csrf']??'',$_SERVER['HTTP_X_CSRF_TOKEN']??'!')) fail('Sessão inválida. Recarregue a página.',403);
 return $op;
}
function uid_valid(string $uid): bool { return preg_match('/^[0-9A-F]{2}(?::[0-9A-F]{2}){3}(?:(?::[0-9A-F]{2}){3}|(?::[0-9A-F]{2}){6})?$/D',$uid)===1; }
