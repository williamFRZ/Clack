<?php
require __DIR__.'/app/bootstrap.php';
exigir_metodo('POST'); $b=body(); $did=id($b,'dispositivo');
$token=$_SERVER['HTTP_AUTHORIZATION']??'';
if(!str_starts_with($token,'Bearer ')) fail('Credencial do dispositivo ausente.',401);
$conexao->begin_transaction();
$d=one('SELECT * FROM dispositivos WHERE id=? AND ativo=1 FOR UPDATE',[$did]);
if(!$d||!hash_equals($d['token_hash'],hash('sha256',substr($token,7)))) fail('Credencial inválida.',401);
q('UPDATE dispositivos SET ultima_conexao=UTC_TIMESTAMP() WHERE id=?',[$did]);
if($d['tipo']==='cadastrador') {
 $capture=one('SELECT * FROM capturas WHERE dispositivo_id=? AND consumida=0 AND expira_em>UTC_TIMESTAMP() ORDER BY expira_em DESC LIMIT 1 FOR UPDATE',[$did]);
 if(isset($b['uid'])) {
  $uid=txt($b,'uid',32); if(!uid_valid($uid)) fail('UID inválido.');
  if(!$capture || !hash_equals($capture['id'],$b['captura']??'')) fail('Captura expirada.',409);
  if($capture['uid'] && $capture['uid']!==$uid) fail('Cartão já capturado.',409);
  q('UPDATE capturas SET uid=? WHERE id=?',[$uid,$capture['id']]);
 }
 $conexao->commit(); resposta_json(['captura'=>$capture&&!$capture['uid']?$capture['id']:null]);
}
$events=$b['eventos']??[];
if(!is_array($events)||count($events)>64) fail('Lote de eventos inválido.');
$ack=[]; $last=(int)$d['ultima_sequencia'];
foreach($events as $event) {
 if(!is_array($event)) fail('Evento inválido.');
 $seq=id($event,'sequencia'); $result=txt($event,'resultado',60);
 $uid=$event['uid']??null; if($uid!==null&&(!is_string($uid)||!uid_valid($uid))) fail('UID inválido.');
 $name=isset($event['nome'])?txt($event,'nome'):null;
 $profile=isset($event['perfil'])?choice($event,'perfil',['professor','aluno','limpeza','completo']):null;
 $ts=$event['timestamp']??null;
 if($ts!==null && (!is_int($ts)||$ts<1704067200||$ts>time()+300)) fail('Data de evento inválida.');
 if(!one('SELECT id FROM eventos WHERE dispositivo_id=? AND sequencia=?',[$did,$seq])) {
  q('INSERT INTO eventos(dispositivo_id,sequencia,ambiente_id,uid,nome,perfil,resultado,ocorrido_em) VALUES(?,?,?,?,?,?,?,?)',[$did,$seq,$d['ambiente_id'],$uid,$name,$profile,$result,$ts?gmdate('Y-m-d H:i:s',$ts):null]);
 }
 $ack[]=$seq;
}
// Snapshot only advances; replay of old events never rolls a room back.
$seq=$b['sequencia']??null;
if(!is_int($seq)||$seq<0) fail('Sequência inválida.');
if($seq>$last) {
 if(!in_array($seq,$ack,true)) fail('Estado precisa do evento correspondente.');
 $state=choice($b,'estado',['disponivel','em_uso','manutencao','erro']);
 $responsible=$b['responsavel']??null;
 if($responsible!==null && (!is_int($responsible)||!one('SELECT id FROM cartoes WHERE id=?',[$responsible]))) fail('Responsável desconhecido.');
 if($state!=='em_uso') $responsible=null;
 q('UPDATE ambientes SET estado=?,responsavel=? WHERE id=?',[$state,$responsible,$d['ambiente_id']]);
 q('UPDATE dispositivos SET ultima_sequencia=? WHERE id=?',[$seq,$did]);
}
if(!empty($b['comando_confirmado'])) {
 $cid=id($b,'comando_confirmado');
 q('UPDATE comandos SET confirmado_em=COALESCE(confirmado_em,UTC_TIMESTAMP()) WHERE id=? AND dispositivo_id=?',[$cid,$did]);
}
$cards=rows('SELECT c.id,c.nome,c.uid,c.perfil FROM cartoes c JOIN permissoes p ON p.cartao_id=c.id WHERE p.ambiente_id=? AND c.ativo=1 AND c.uid IS NOT NULL ORDER BY c.id',[$d['ambiente_id']]);
if(count($cards)>100) fail('Limite de 100 cartões por dispositivo excedido.',409);
$version=hash('sha256',json_encode($cards));
if(isset($b['versao']) && is_string($b['versao']) && strlen($b['versao'])<=64) q('UPDATE dispositivos SET versao=? WHERE id=?',[$b['versao'],$did]);
$cmd=one('SELECT id,acao FROM comandos WHERE dispositivo_id=? AND confirmado_em IS NULL AND expira_em>UTC_TIMESTAMP() ORDER BY id LIMIT 1',[$did]);
$conexao->commit(); resposta_json(['confirmados'=>$ack,'cartoes'=>$cards,'versao'=>$version,'comando'=>$cmd,'hora'=>time()]);
