# Configurar a primeira sala no Clack

O servidor Docker deve estar iniciado. Abra http://localhost:8080/painel/ e
entre como administrador. Não é necessário ter um ESP32 para cadastrar e
posicionar a sala; o hardware é necessário para abrir a tranca e registrar uso.

## 1. Criar o ambiente

1. Abra **Configurações**.
2. Em **Ambientes e dispositivos**, clique em **Cadastrar sala**.
3. Preencha **Nome**, por exemplo `Sala 101` (use o nome real da sua sala).
4. Escolha **Andar 1**, **Andar 2** ou **Andar 3**.
5. Escolha a **Categoria**: Sala de aula, Administrativa ou Outra.
6. A planta do andar selecionado aparece no formulário. Clique no centro da
   sala para posicionar o quadrado; X/Y são preenchidos automaticamente.
   Use zoom se necessário e clique novamente para corrigir. Ao trocar de andar,
   a seleção de posição é limpa para você escolher o local na nova planta.
7. Clique em **Salvar**.

Você terá um cadastro disponível, com a posição escolhida. Se deixar X/Y vazios,
a posição será provisória e poderá ser definida no passo 2. Criar o ambiente
não associa uma tranca nem concede acesso a cartões automaticamente.

## 2. Colocar o quadrado na planta

1. Abra **Ambientes** e selecione o mesmo andar.
2. Clique em **Posicionar salas**.
3. Em **Sala para posicionar**, selecione a sala criada.
4. Clique no centro dessa sala na planta, ajustando o zoom se necessário.
5. Aguarde a mensagem **Posição na planta salva** e clique em
   **Concluir posicionamento**.

O quadrado verde indica uma sala disponível. As coordenadas são percentuais
e continuam válidas com zoom e no celular. Para corrigir, repita o procedimento
ou abra **Configurações → Editar posição**.

Até aqui você já pode conferir a sala na interface, sem hardware.

## 3. Vincular a tranca

1. Volte a **Configurações → Cadastrar dispositivo**.
2. Preencha **Nome**, por exemplo `Tranca Sala 101`.
3. Em **Tipo**, selecione **Tranca**.
4. Em **Sala (apenas tranca)**, selecione a sala criada e salve.
5. Copie o **ID** e o **Token** exibidos. O token aparece uma única vez;
   guarde-o em `esp32/include/config.local.h`, fora do Git.

Para conectar o ESP32, altere `CLACK_BIND_IP=0.0.0.0` no `.env` e execute:

```sh
docker compose up -d --wait
```

Use o IPv4 LAN do computador (consulte `ipconfig` no Windows). Em
`config.local.h`, configure Wi-Fi, ID/token e:

```cpp
#define SERVER_URL "http://IP_DO_COMPUTADOR:8080/dispositivo.php"
#define DEVICE_MODE 0
```

Substitua `IP_DO_COMPUTADOR` pelo IP real e ajuste a porta se necessário.
Não use `localhost` no ESP32. Confira acesso pela mesma rede e firewall.
Consulte [DOCKER.md](DOCKER.md#8-cadastrar-e-gravar-os-dispositivos) e
[GESTAO.md](GESTAO.md#modos-e-fios) para pinagem, alimentação e gravação.
Inicialize LittleFS apenas em hardware novo; não repita `uploadfs` em
dispositivo em uso. Após sincronizar, confira o indicador online da sala.

## 4. Autorizar um cartão

O cadastro pela interface usa um **cadastrador dedicado**, outro ESP32 com
`DEVICE_MODE=1`, registrado em Configurações como tipo Cadastrador.

1. Abra **Cartões → Novo cartão**.
2. Escolha o cadastrador online, inicie captura e aproxime o cartão.
3. Preencha nome, matrícula ou pessoa externa (NDA) e perfil.
4. Para Professor, Aluno, Limpeza ou Completo, selecione a sala criada.
   TI tem acesso global, incluindo salas cadastradas depois do cartão.
5. Salve e aguarde a tranca sincronizar as permissões.

## 5. Conferir o funcionamento

Teste primeiro na bancada, com o servo calibrado e alimentação adequada.
Com a sala disponível, aproxime o cartão autorizado. Confira o resultado no
OLED, no painel e no Histórico. Retire o cartão antes de aproximá-lo novamente.
Ao iniciar uma atividade, a sala passa a mostrar responsável e início de uso.

As cores são: verde disponível, vermelho em uso, laranja atividade da TI e
amarelo atividade da limpeza. TI em uma sala ocupada por outra pessoa abre a
tranca sem trocar o responsável. Manutenção/erro aparecem em cinza.

O estado do painel é lógico; sem sensor, ele não confirma a posição mecânica
do trinco. Testes físicos, falta de rede e corte/retorno de energia permanecem
necessários antes de instalar em uma porta real.
