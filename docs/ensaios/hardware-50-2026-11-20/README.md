# Dimensionamento do servidor Clack — 20/11/2026

**Configuração inicial proposta para Windows:** computador x86-64 com 4 processadores lógicos, virtualização habilitada, 8 GB de RAM física e 20 GB livres em SSD no volume usado pelo Docker. Uma rede local estável deve permitir que as trancas alcancem o servidor em endereço fixo ou reservado. Para uma estação que também roda navegador, IDE e outros aplicativos, sugerimos 16 GB de RAM. São referências para aquisição ou seleção de equipamento, a validar no PC de destino.

## Como foi medido

Ryzen 7 PRO 1700, 8 núcleos e 16 threads, aproximadamente 8 GB de RAM física. Docker 29.8.0 com 16 CPUs lógicas visíveis e 3,79 GiB disponíveis ao motor. O projeto descartável impôs por container uma cota de 1 CPU, com limite de memória de 512 MiB no Apache/PHP e 1 GiB no MySQL. O limite de memória mais swap foi igual ao limite de memória. As cotas limitam tempo de CPU e não fixam núcleos físicos. O cliente de carga rodou no host.

Foram simuladas 50 trancas com sincronização concorrente, dez períodos, 500 aberturas, 500 fechamentos, 2.000 sincronizações periódicas e 60 consultas do painel. Foram obtidas 6 amostras por serviço em repouso após o cadastro e 30 durante a carga pelo comando Docker Stats. O curto intervalo de repouso e a transição para carga podem influenciar a primeira e a última leitura. Memória é o valor reportado pelo Docker para o container, sem Windows, WSL, motor Docker, navegador ou ferramentas de compilação. As máximas abaixo são amostrais.

| Serviço | RAM mediana em repouso | RAM mediana em carga | Maior RAM observada | CPU mediana em carga | Maior CPU observada |
|---|---:|---:|---:|---:|---:|
| Apache/PHP | 22,4 MiB | 27,6 MiB | 30,8 MiB | 18,7% | 36,4% |
| MySQL | 457,0 MiB | 471,3 MiB | 473,0 MiB | 27,5% | 49,7% |

Na escala de CPU usada, 100% corresponde a um processador lógico ocupado. O maior consumo combinado observado na mesma amostra foi **503,8 MiB**. Em **60,04 s**, as **3.060 requisições medidas** terminaram sem erro, o P95 das trancas foi de **280 ms**, o histórico continha os **1.000 eventos** esperados e nenhum serviço reiniciou.

## Disco e margem de instalação

As imagens web e MySQL informaram tamanhos lógicos de aproximadamente 715 MB e 1.106 MB. Camadas compartilhadas, caches de build, imagens de versões anteriores e o disco virtual do Docker alteram a ocupação física. No volume descartável do MySQL, o espaço alocado passou de 215.132 para 217.272 KiB (210,1 para 212,2 MiB). A diferença inclui atividade interna do MySQL e não determina o custo por evento a longo prazo. Os 20 GB livres propostos dão margem para instalação, atualização, logs e cópias temporárias. Dimensionar retenção e backups conforme os dados reais.

## Interpretação para o TCC

O ensaio validou **um perfil de execução com cota total equivalente a 2 CPUs e teto combinado de 1,5 GiB para os serviços**. A sugestão de 4 processadores lógicos no host deixa margem para o sistema operacional e virtualização. O menor processador compatível, a RAM mínima absoluta, o pico durante a compilação e a estabilidade por várias horas não foram determinados. Para Windows, o Docker especifica processador de 64 bits com SLAT, virtualização de hardware e 8 GB de RAM de sistema; conferir também a versão de Windows compatível e os requisitos de WSL 2 na [documentação oficial](https://docs.docker.com/desktop/setup/install/windows-install/).

Para reproduzir: na raiz do repositório, executar `python tests/simular_dia_ifsul.py pasta-nova --hardware` com Docker ativo. A pasta de saída deve ser nova. [CPU, memória e E/S](hardware.csv) · [Tamanho do banco](disco.json) · [Latências individuais](requisicoes.csv) · [Integridade e desempenho](resultado.json).
