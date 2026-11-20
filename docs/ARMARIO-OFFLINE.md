# Armário independente com cadastro de tags

O programa [armario_offline.ino](../armario_offline/armario_offline.ino) usa
ESP32, RC522 e servo. Funciona sem rede, painel, servidor ou cadastrador. É um
programa separado do firmware da sala; sua memória não compartilha as permissões
nem o histórico do servidor.

## Uso

1. Na primeira instalação, deixe o mecanismo fisicamente fechado e calibre os
   ângulos sem carga. O programa inicia supondo que o armário está fechado e
   não move o servo automaticamente ao ligar.
2. Aproxime uma tag desconhecida e mantenha-a continuamente no leitor por
   10 segundos. Ao completar o tempo, ela é salva e o servo recebe o comando
   de abertura. É possível salvar até 20 tags.
3. Afaste a tag por pelo menos um segundo. Cada nova aproximação de qualquer
   tag cadastrada alterna entre fechar e abrir. Após cada acionamento, afaste
   a tag novamente para uma nova leitura.
4. Para acrescentar outra tag, repita o passo 2. Os cadastros e o último estado
   comandado permanecem na memória quando a placa é desligada.

Qualquer pessoa com acesso físico ao leitor pode cadastrar uma tag mantendo-a
por 10 segundos. Além disso, a identificação usa apenas o UID, que pode ser
copiado em alguns cartões. Não use esta versão para proteger bens que precisem
de controle forte de acesso. Não há interface para remover uma tag individual;
apagar ou regravar toda a memória da placa também pode apagar os cadastros.

O estado salvo representa o último comando, não uma medição da posição: não há
sensor no trinco. Uma queda de energia durante o movimento, servo travado ou
movimento manual pode deixar o mecanismo em posição diferente da esperada.
Confira e ajuste o mecanismo antes de utilizá-lo novamente.

## Ligações da montagem padrão

Com a alimentação desligada, conecte RC522: SDA/SS → GPIO 5, SCK → GPIO 18,
MISO → GPIO 19, MOSI → GPIO 23, RST → GPIO 22, 3,3 V → 3V3 e GND → GND.
Servo: sinal → GPIO 13; use uma alimentação de 5 V adequada ao servo e una o
GND da fonte ao GND do ESP32. Não alimente o RC522 com 5 V. Calibre
`ANGULO_ABERTO` e `ANGULO_FECHADO` no início do programa para o mecanismo real;
os valores iniciais são 0 e 180 graus.

## Gravar pela Arduino IDE

1. Instale o suporte a ESP32 na IDE e as bibliotecas **MFRC522** e
   **ESP32Servo** pelo gerenciador de bibliotecas.
2. Abra `armario_offline/armario_offline.ino`. Mantenha
   `controle_armario.h` na mesma pasta: o programa depende desse arquivo.
3. Escolha a placa ESP32 e a porta USB corretas. Confirme os pinos e os ângulos
   antes de compilar e carregar. Não escolha a opção de apagar toda a memória.
4. Abra o monitor serial em 115200 para acompanhar mensagens de operação. O
   resultado de leitura da versão do RC522 não comprova que a antena está boa.

Para compilar com PlatformIO: `pio run -d armario_offline`. A compilação e os
testes automatizados não substituem os testes com leitor, tags e servo reais.
A tranca 204 apresentava falha intermitente de leitura; este programa não
corrige falha física no RC522. Foi gravado nela em 09/11/2026; o cadastro de
uma tag e o movimento do servo foram confirmados. Ainda faltam testes com várias
tags, reinício e mecanismo montado, além da investigação da intermitência.
