<?php
require __DIR__.'/app/bootstrap.php';
start_session();
$action=$_GET['acao']??'sessao';
if($action==='login') {
 exigir_metodo('POST'); $b=body(); $login=txt($b,'login'); $password=txt($b,'senha',72);
 $key=hash('sha256',($_SERVER['REMOTE_ADDR']??'local').'|'.strtolower($login));
 q('INSERT IGNORE INTO tentativas_login(chave,inicio) VALUES(?,UTC_TIMESTAMP())',[$key]);
 q('UPDATE tentativas_login SET quantidade=0,inicio=UTC_TIMESTAMP() WHERE chave=? AND inicio<UTC_TIMESTAMP()-INTERVAL 15 MINUTE',[$key]);
 if((int)one('SELECT quantidade FROM tentativas_login WHERE chave=?',[$key])['quantidade']>=10) fail('Muitas tentativas. Aguarde 15 minutos.',429);
 q('UPDATE tentativas_login SET quantidade=quantidade+1 WHERE chave=?',[$key]);
 $op=one('SELECT * FROM operadores WHERE login=? AND ativo=1',[$login]);
 if(!$op||!password_verify($password,$op['senha'])) fail('Login ou senha incorretos.',401);
 q('DELETE FROM tentativas_login WHERE chave=?',[$key]); session_regenerate_id(true);
 $_SESSION=['op'=>$op['id'],'last'=>time(),'csrf'=>bin2hex(random_bytes(32))];
 audit($op,'login',[]); unset($op['senha']); resposta_json(['operador'=>$op,'csrf'=>$_SESSION['csrf']]);
}
$op=operator();
if($action==='sessao') { exigir_metodo('GET'); resposta_json(['operador'=>$op,'csrf'=>$_SESSION['csrf']]); }
if($action==='logout') { exigir_metodo('POST'); $_SESSION=[]; session_destroy(); resposta_json(['ok'=>true]); }
if($action==='painel') {
 exigir_metodo('GET');
 resposta_json(['salas'=>rows('SELECT a.*,c.nome responsavel_nome,d.id dispositivo_id,d.ultima_conexao,d.versao,IF(d.ultima_conexao>UTC_TIMESTAMP()-INTERVAL 20 SECOND,1,0) online FROM ambientes a LEFT JOIN cartoes c ON c.id=a.responsavel LEFT JOIN dispositivos d ON d.ambiente_id=a.id AND d.ativo=1 ORDER BY a.andar,a.nome'),
 'cartoes'=>rows('SELECT * FROM cartoes ORDER BY nome'),'permissoes'=>rows('SELECT * FROM permissoes'),
 'dispositivos'=>rows('SELECT id,nome,tipo,ambiente_id,ativo,ultima_conexao FROM dispositivos ORDER BY nome'),
 'comandos'=>rows('SELECT c.*,o.nome operador FROM comandos c JOIN operadores o ON o.id=c.operador_id ORDER BY c.id DESC LIMIT 50')]);
}
if($action==='historico') {
 exigir_metodo('GET'); $params=[]; $where='WHERE 1=1';
 if(!empty($_GET['sala'])) { $where.=' AND e.ambiente_id=?'; $params[]=id($_GET,'sala'); }
 if(!empty($_GET['antes'])) { $where.=' AND e.id<?'; $params[]=id($_GET,'antes'); }
 resposta_json(['eventos'=>rows('SELECT e.*,a.nome sala FROM eventos e JOIN ambientes a ON a.id=e.ambiente_id '.$where.' ORDER BY e.id DESC LIMIT 100',$params),
 'auditoria'=>rows('SELECT a.*,o.nome operador FROM auditoria a JOIN operadores o ON o.id=a.operador_id ORDER BY a.id DESC LIMIT 100')]);
}
if($action==='operadores') {
 operator(true); exigir_metodo('GET'); resposta_json(['operadores'=>rows('SELECT id,nome,login,papel,ativo FROM operadores ORDER BY nome')]);
}
exigir_metodo('POST'); $b=body();
$conexao->begin_transaction();
switch($action) {
case 'cartao':
 $nome=txt($b,'nome'); $perfil=choice($b,'perfil',['professor','aluno','limpeza','completo']);
 $external=($b['externo']??false)===true; $matricula=$external?null:txt($b,'matricula',50);
 $cid=isset($b['id'])?id($b):null; $old=$cid?one('SELECT * FROM cartoes WHERE id=? FOR UPDATE',[$cid]):null;
 if($cid&&!$old) fail('Cartão não encontrado.',404);
 $uid=$old['uid']??null;
 if(!empty($b['captura'])) {
  $capture=one('SELECT * FROM capturas WHERE id=? AND operador_id=? AND consumida=0 AND expira_em>UTC_TIMESTAMP() FOR UPDATE',[txt($b,'captura',32),$op['id']]);
  if(!$capture||!$capture['uid']) fail('Aproxime o cartão do cadastrador e tente novamente.');
  $uid=$capture['uid']; q('UPDATE capturas SET consumida=1 WHERE id=?',[$capture['id']]);
 }
 if(!$cid&&!$uid) fail('Capture um cartão antes de cadastrar.');
 if($uid && one('SELECT id FROM cartoes WHERE uid=? AND id<>?',[$uid,$cid??0])) fail('Este cartão já está cadastrado.',409);
 $roomIds=$b['salas']??[]; if(!is_array($roomIds)||count($roomIds)>200) fail('Salas inválidas.');
 $roomIds=array_values(array_unique(array_map(fn($v)=>id(['id'=>$v]),$roomIds)));
 foreach($roomIds as $rid) if(!one('SELECT id FROM ambientes WHERE id=?',[$rid])) fail('Sala não encontrada.');
 $active=($b['ativo']??true)===true?1:0;
 if($cid) q('UPDATE cartoes SET nome=?,matricula=?,externo=?,uid=?,perfil=?,ativo=? WHERE id=?',[$nome,$matricula,(int)$external,$uid,$perfil,$active,$cid]);
 else { q('INSERT INTO cartoes(nome,matricula,externo,uid,perfil,ativo) VALUES(?,?,?,?,?,?)',[$nome,$matricula,(int)$external,$uid,$perfil,$active]); $cid=$conexao->insert_id; }
 q('DELETE FROM permissoes WHERE cartao_id=?',[$cid]); foreach($roomIds as $rid) q('INSERT INTO permissoes VALUES(?,?)',[$cid,$rid]);
 audit($op,'cartao_salvo',['id'=>$cid,'perfil'=>$perfil,'salas'=>$roomIds,'ativo'=>$active]); break;
case 'resetar_cartao':
 $cid=id($b); if(!one('SELECT id FROM cartoes WHERE id=? FOR UPDATE',[$cid])) fail('Cartão não encontrado.',404);
 q('UPDATE cartoes SET uid=NULL,ativo=0 WHERE id=?',[$cid]); q('DELETE FROM permissoes WHERE cartao_id=?',[$cid]);
 audit($op,'cartao_desvinculado',['id'=>$cid]); break;
case 'sala':
 operator(true); $name=txt($b,'nome',50); $floor=txt($b,'andar',50); $cat=choice($b,'categoria',['aula','administrativa','outra']);
 $x=filter_var($b['x']??0,FILTER_VALIDATE_INT); $y=filter_var($b['y']??0,FILTER_VALIDATE_INT);
 if($x===false||$y===false||$x<0||$y<0||$x>850||$y>850) fail('Posição deve estar entre 0 e 850.');
 if(isset($b['id'])) { $rid=id($b); if(!one('SELECT id FROM ambientes WHERE id=?',[$rid])) fail('Sala não encontrada.',404); q('UPDATE ambientes SET nome=?,andar=?,categoria=?,x=?,y=? WHERE id=?',[$name,$floor,$cat,$x,$y,$rid]); }
 else { q('INSERT INTO ambientes(nome,andar,categoria,x,y) VALUES(?,?,?,?,?)',[$name,$floor,$cat,$x,$y]); $rid=$conexao->insert_id; }
 audit($op,'sala_salva',['id'=>$rid]); break;
case 'comando':
 $rid=id($b,'sala'); $cmd=choice($b,'comando',['abrir','fechar','manutencao','liberar']);
 $device=one("SELECT * FROM dispositivos WHERE ambiente_id=? AND ativo=1 AND ultima_conexao>UTC_TIMESTAMP()-INTERVAL 20 SECOND FOR UPDATE",[$rid]);
 if(!$device) fail('Dispositivo offline. Comando não enviado.',409);
 if(one('SELECT id FROM comandos WHERE dispositivo_id=? AND confirmado_em IS NULL AND expira_em>UTC_TIMESTAMP()',[$device['id']])) fail('Aguarde o comando pendente.',409);
 q('INSERT INTO comandos(dispositivo_id,operador_id,acao,expira_em) VALUES(?,?,?,UTC_TIMESTAMP()+INTERVAL 30 SECOND)',[$device['id'],$op['id'],$cmd]);
 audit($op,'comando_enviado',['sala'=>$rid,'comando'=>$cmd]); break;
case 'capturar':
 $did=id($b,'dispositivo');
 if(!one("SELECT id FROM dispositivos WHERE id=? AND tipo='cadastrador' AND ativo=1 AND ultima_conexao>UTC_TIMESTAMP()-INTERVAL 20 SECOND FOR UPDATE",[$did])) fail('Cadastrador offline.',409);
 if(one('SELECT id FROM capturas WHERE dispositivo_id=? AND consumida=0 AND expira_em>UTC_TIMESTAMP()',[$did])) fail('Cadastrador já reservado. Aguarde até dois minutos.',409);
 $capture=bin2hex(random_bytes(16)); q('INSERT INTO capturas(id,operador_id,dispositivo_id,expira_em) VALUES(?,?,?,UTC_TIMESTAMP()+INTERVAL 2 MINUTE)',[$capture,$op['id'],$did]);
 $conexao->commit(); resposta_json(['captura'=>$capture]);
case 'ler_captura':
 $capture=one('SELECT uid,expira_em FROM capturas WHERE id=? AND operador_id=? AND consumida=0 AND expira_em>UTC_TIMESTAMP()',[txt($b,'captura',32),$op['id']]);
 if(!$capture) fail('Captura expirada. Inicie outra.',410); $conexao->commit(); resposta_json($capture);
case 'operador':
 operator(true); $name=txt($b,'nome'); $login=txt($b,'login'); $role=choice($b,'papel',['admin','portaria']); $pass=txt($b,'senha',72);
 if(strlen($pass)<12) fail('Use uma senha de pelo menos 12 caracteres.');
 if(one('SELECT id FROM operadores WHERE login=?',[$login])) fail('Login já cadastrado.',409);
 q('INSERT INTO operadores(nome,login,senha,papel) VALUES(?,?,?,?)',[$name,$login,password_hash($pass,PASSWORD_DEFAULT),$role]);
 audit($op,'operador_criado',['id'=>$conexao->insert_id]); break;
case 'bloquear_operador':
 operator(true); $oid=id($b); if($oid===$op['id']) fail('Não é possível bloquear sua própria conta.');
 q('UPDATE operadores SET ativo=0 WHERE id=?',[$oid]); audit($op,'operador_bloqueado',['id'=>$oid]); break;
case 'dispositivo':
 operator(true); $name=txt($b,'nome'); $type=choice($b,'tipo',['tranca','cadastrador']); $room=$type==='tranca'?id($b,'sala'):null;
 if($room && (!one('SELECT id FROM ambientes WHERE id=?',[$room]) || one('SELECT id FROM dispositivos WHERE ambiente_id=?',[$room]))) fail('Sala inexistente ou já vinculada.');
 $token=bin2hex(random_bytes(32)); q('INSERT INTO dispositivos(nome,tipo,ambiente_id,token_hash) VALUES(?,?,?,?)',[$name,$type,$room,hash('sha256',$token)]);
 $did=$conexao->insert_id; audit($op,'dispositivo_criado',['id'=>$did]); $conexao->commit(); resposta_json(['id'=>$did,'token'=>$token]);
default: fail('Ação desconhecida.',404);
}
$conexao->commit(); resposta_json(['ok'=>true]);
