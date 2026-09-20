<?php
// Development server only: php -S 0.0.0.0:8080 router.php
$path=parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH);
$allowed=['/','/index.html','/api.php','/dispositivo.php'];
if(in_array($path,$allowed,true)||preg_match('~^/painel/(?:index\.html|assets/[A-Za-z0-9_.-]+\.(?:js|css|png|jpg|jpeg|webp))?$~D',$path)) return false;
http_response_code(404); echo 'Não encontrado';
