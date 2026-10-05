# Plantas do IFSul

Coloque aqui as imagens reais, usando andar-1.png, andar-2.png e andar-3.png.
Também são aceitos .jpg, .jpeg e .webp; use somente uma imagem por andar.
Execute `npm run build --prefix frontend` a partir da raiz do repositório.

Cada imagem substitui automaticamente o placeholder do andar correspondente.
A imagem inteira é exibida sem distorção, com zoom e rolagem. Cada sala cadastrada
tem um marcador quadrado com sua atividade. Os cartões de salas continuam abaixo.
Marcadores tracejados usam posições provisórias; em Posicionar salas, selecione o
cadastro e clique no centro real. X/Y são percentuais da imagem, salvos no banco.

Os três andares ficam sempre disponíveis. Cadastros antigos chamados Térreo são
exibidos no Andar 1, sem alteração automática no banco. Outros nomes não reconhecidos
continuam visíveis no aviso de salas sem andar padronizado e podem ser corrigidos em Configurações.

As três plantas estilizadas em PNG fornecidas em 04/10/2026 são preservadas sem
alteração de pixels. O visualizador apresenta imagens verticais em orientação
horizontal por CSS, girando 90° no sentido horário. Os marcadores e suas
coordenadas percentuais usam essa área horizontal, inclusive durante o zoom. A
versão do Andar 2 preserva o vazio central do saguão/átrio. As plantas técnicas
originais permanecem em `originais/` apenas como referência e não entram na
compilação do painel.

O visualizador permite zoom e abertura da imagem em tamanho completo.
