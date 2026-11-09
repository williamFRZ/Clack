# Validação do Clack

## Automatizada, com dados descartáveis
- `node tests/room_status_test.mjs`: estados, perfis, horários e marcadores; executado com sucesso nesta rodada.
- `sh tests/docker_test.sh`: usar ambiente com Docker acessível, shell POSIX e Python 3. O roteiro escolhe projeto/volume próprios e porta 18080, sem carregar compose.override.yaml. Cria dados artificiais e remove somente seus volumes ao terminar.
- O teste Python exige CLACK_TEST_DISPOSABLE=1 e CLACK_TEST_URL explícitos. Não aponte esses valores para o servidor de uso real.
- Acrescentadas verificações de comando pendente, confirmado, ID, tempo de confirmação e idade do último contato. Integração Docker pendente de execução nesta rodada por acesso negado ao mecanismo.

## Ensaio físico acompanhado
Registre data, versão do firmware, resultado e tempo observado em cada cenário. Use cartão e sala de teste e acompanhe o mecanismo.

| Cenário | Verificação esperada | Resultado |
|---|---|---|
| Cartão autorizado | Permissão respeitada, servo acionado e evento no histórico | Pendente nesta rodada |
| Cartão bloqueado | Após sincronizar revogação, acesso negado e vínculo preservado | Pendente |
| Cartão desvinculado | Após sincronização, cartão sem acesso pelo antigo vínculo | Pendente |
| Outro professor: toque curto | Sem movimento do servo e sem trocar o responsável | Validado na 204 em 09/11/2026 |
| Outro professor: manter por 3 s | Uma única transferência, sem mover o servo nem encerrar a sala enquanto a tag permanecer | Validado na 204 em 09/11/2026 |
| Transferência interrompida | Retirar antes de 3 s não muda o responsável; após retirada, pode tentar novamente | Validado na 204 em 09/11/2026 |
| Após transferência | Retirar a tag e aproximar novamente encerra a atividade do novo responsável | Validado na 204 em 09/11/2026 |
| Manutenção | Restrições respeitadas; encerrar manutenção restaura disponibilidade | Pendente |
| Wi-Fi interrompido | Indicação de perda de comunicação; painel preserva último estado conhecido | Pendente |
| Wi-Fi restabelecido | Eventos reconciliados sem duplicação e contato atualizado | Pendente |
| Reinício da ESP | Estado persistido reconciliado; nenhuma abertura inesperada | Pendente |
| Dois operadores simultâneos | Apenas um comando pendente aceito; outro recebe orientação para aguardar | Pendente |
| Comando sem confirmação | Expira sem ser apresentado como execução física confirmada | Pendente |

O funcionamento de abrir/fechar da 204 foi confirmado pelo usuário anteriormente. Isso não valida automaticamente os demais cenários ou o build atual. Revogação offline depende da política/cache do firmware; não presumir efeito imediato sem sincronização.
