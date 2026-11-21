# Clack | Ensaio de 50 trancas simultâneas

Em 20/11/2026, o servidor concluiu **3.060 requisições medidas sem erro** em 60,04 s. O histórico final continha os 1.000 eventos esperados. Em todas as 60 rodadas, os intervalos medidos no cliente confirmaram que as 50 chamadas de trancas estiveram em andamento ao mesmo tempo. Isso representa concorrência no cliente; a ordem e o paralelismo internos do Apache e do MySQL podem variar.

## Método

Usamos um projeto Docker Compose descartável, acessível apenas por loopback na máquina Windows, com Apache/PHP e MySQL 8.4. O Docker 29.8.0 informava 16 CPUs lógicas e 3,79 GiB de memória disponíveis ao motor. Foram cadastradas pela API 50 salas fictícias, com uma identidade de dispositivo e um cartão de professor autorizado por sala. O cenário foi escolhido para o ensaio; os horários e o volume de uso não vieram de observação do campus.

Foram simulados dez períodos iniciando às 08h, 09h e assim por diante, até 17h, com encerramento aos 50 minutos de cada hora. Os eventos receberam horários lógicos de 19/11 em UTC−3. Em tempo real, cada período ocupou seis rodadas, com disparos a intervalos de aproximadamente um segundo: abertura de 50 atividades, quatro consultas por tranca e fechamento das 50 atividades. Uma barreira sincronizou os clientes. Em cada rodada um cliente adicional consultou a API do painel. Nenhuma requisição de carga foi repetida após falha. Cadastro, aquecimento do servidor durante a preparação e consultas extras de verificação não entram nas 3.060 medições.

## Resultados

| Operação | Requisições | Erros | Mediana | P95 | Máxima |
|---|---:|---:|---:|---:|---:|
| Abertura | 500 | 0 | 127 ms | 340 ms | 469 ms |
| Consulta periódica da tranca | 2.000 | 0 | 109 ms | 275 ms | 388 ms |
| Fechamento | 500 | 0 | 131 ms | 317 ms | 416 ms |
| Consulta do painel | 60 | 0 | 110 ms | 295 ms | 365 ms |
| Trancas, todas as operações | 3.000 | 0 | 114 ms | 292 ms | 469 ms |

A latência vai do início da chamada no cliente até a leitura e validação da resposta. O P95 é o percentil 95 por posto superior. A última linha agrega as três primeiras. A taxa média foi de aproximadamente 51 requisições medidas por segundo.

Depois de cada abertura e fechamento, o ensaio verificou o estado e o responsável das 50 salas (1.000 comparações, zero divergências). Ao final, conferiu as 20 sequências de cada sala, o dispositivo de origem, o UID e o tipo de evento. Todas as salas terminaram disponíveis. Os containers web e de banco permaneceram com os mesmos identificadores, sem aumento no contador de reinícios e com estado saudável na leitura final.

**Interpretação.** O servidor sustentou picos sincronizados de 50 clientes para este conjunto de dados e esta máquina. Foi uma execução acelerada de um dia lógico. Para avaliar estabilidade contínua, é necessário repetir o cenário por várias horas, monitorando consumo de memória e evolução da latência, além de incluir rede Wi-Fi, históricos maiores e reconexões. O ensaio não mediu tempo mecânico nem interação com leitores reais.

**Reprodução.** Com Python 3 e Docker Compose, execute `python tests/simular_dia_ifsul.py pasta-nova` na raiz do repositório. O programa usa uma porta local dinâmica, banco novo, credenciais de teste temporárias e coleta medições em CSV. [Script](../../../tests/simular_dia_ifsul.py) · [Medições individuais](requisicoes.csv) · [Resumo numérico](resultado.json).
