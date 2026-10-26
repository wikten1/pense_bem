# Perguntas e respostas do Aladdin

O catálogo ativo do aplicativo Expo fica em `src/content/aladdin.ts`. São 150
questões, divididas em cinco programas de 30, agora com resposta e justificativa.
As 88 pendências anteriores foram revisadas. O Programa 6 sorteia seis questões
de cada programa anterior; a semente salva preserva o sorteio na retomada.
As letras A/B/C/D dos botões correspondem a vermelho/amarelo/azul/verde.

## Revisão visual e procedência

Fonte: `assets/pdfs/pense_bem_-_disney_-_aladdin_em_os_misterios_do_oriente.pdf`.
As páginas abaixo são as posições no PDF (começando por 1), não a numeração
impressa da revista. Por exemplo, a página 5 do PDF é a página impressa 3.

As páginas digitalizadas foram examinadas como imagens, incluindo personagens,
instrumentos, acidentes geográficos, peças do quebra-cabeça e quadros em
sequência. O PDF não contém gabarito impresso: as respostas são uma revisão
editorial baseada nas figuras, nos textos e, quando necessário, nas fontes
externas indicadas abaixo. Não se trata de um gabarito oficial do brinquedo.

Foram incluídos 23 recortes locais, utilizados por 66 questões. As demais
atividades funcionam com os enunciados, textos de apoio e alternativas textuais.
O componente `QuestionIllustration` permite ampliar e deslocar a imagem; também
fornece descrições para leitores de tela. Os arquivos ficam em
`assets/images/questions/aladdin/` e funcionam sem conexão. As versões atuais
foram preparadas para telas digitais, com recriação visual revisada e restauração
direta nos casos em que o redesenho não ficou disponível; consulte o
[registro da recriação visual](recriacao-imagens.md).

O script `scripts/extract-aladdin-illustrations.ps1` exporta os mestres revisados
e confere a identidade do PDF original. Sharp é usado apenas na preparação dos
arquivos, como dependência de desenvolvimento. Execute, na raiz do projeto:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/extract-aladdin-illustrations.ps1
```

## Adaptações e correções editoriais

| Questões | Decisão |
| --- | --- |
| 1 a 6 | Mostrar a cena do palácio. Aladdin está parado olhando para ele, Abu está ao lado, Aladdin é maior, Abu é menor, há torres e o palácio é mais alto. |
| 20 | Explicitar que o salto é para a frente, em distância horizontal. A alternativa de 10 metros é sustentada pelo zoológico de Edimburgo. |
| 21 a 28 | Usar a figura numerada da página anterior do PDF (8); as alternativas ficam na página 9. |
| 34 a 37 | Identificar o músico por posição e característica, pois os números não estão impressos sobre os instrumentos. |
| 66 | A figura mostra ondas quebrando sobre rochas: recife, alternativa verde. |
| 74 a 79 | Conferir o encaixe das seis peças por montagem visual. Peças, na ordem das lacunas: D, B, A, F, C, E. Botões, na mesma ordem: A, B, D, B, A, D. |
| 99 a 104 | Acrescentar a instrução e o texto da história. Ordem dos quadros: B, F, A, C, D, E. |
| 133 | A revista oferece 35 milhões de dólares, mas nenhuma opção corresponde ao orçamento de 28 milhões registrado nas fontes consultadas. Corrigir a opção D para 28 milhões e explicitar a alteração na justificativa. |
| 134 | Confirmar os três anos de realização pela entrevista com o codiretor John Musker. |
| 135 a 140 | Acrescentar a instrução de ordenar o surgimento do Gênio. Ordem dos quadros: C, D, B, F, A, E. |
| 141 | Explicitar na justificativa que Robin Williams é a voz original em inglês. |
| 142 | Corrigir o nome do compositor de Allan para Alan Menken. |
| 145 e 146 | A figura marca o maestro como 145 e a cantora como 146; as alternativas estão trocadas. Preservar as alternativas e explicitar nos enunciados: Q145 pergunta pela mulher com partitura (146 na figura); Q146 pergunta pela pessoa com batuta (145 na figura). |
| 150 | A revista oferece 84 minutos, mas a ficha oficial Disney/D23 informa 90. Corrigir a opção B para 90 e registrar a alteração na justificativa. |

As alternativas ilustradas que já estavam transcritas foram preservadas na
ordem das cores. Os pictogramas das questões 105 a 111 continuam representados
por lacunas. O aparente erro tipográfico “logo-guará” da Q73 foi preservado;
ele não interfere na resposta correta, lobisomem.

Fontes externas utilizadas nos pontos que o PDF não resolve sozinho:

- [Edinburgh Zoo: Sumatran tiger](https://www.edinburghzoo.org.uk/animals/animal-inhabitants/sumatran-tiger): salto horizontal de 10 metros, Q20.
- [Box Office Mojo: Aladdin (1992)](https://www.boxofficemojo.com/title/tt0103639.htm/): orçamento de 28 milhões de dólares, Q133.
- [The Numbers: Aladdin (1992)](https://www.the-numbers.com/movie/Aladdin-%281992%29): confirmação adicional do orçamento, Q133.
- [Entrevista com John Musker, Indie Cinema Magazine](https://indie-cinema.com/2024/09/interview-with-film-director-and-animation-legend-john-musker/): três anos de realização, Q134.
- [Disney/D23: Aladdin (film)](https://d23.com/a-to-z/aladdin-film/): voz original do Gênio e duração de 90 minutos, Q141 e Q150.
- [Academia: Oscar de 1993](https://www.oscars.org/oscars/ceremonies/1993): trilha de Alan Menken e canção A Whole New World, Q142 e Q143.

## Pontuação e partidas anteriores

Cada questão admite três escolhas distintas: acertos rendem 3, 2 ou 1 ponto;
três erros rendem zero. Os seis programas podem ser avaliados integralmente,
somando até 90 pontos e gerando a senha da Nota Desafio ao final. A justificativa
é exibida depois que a pergunta termina.

Ao retomar uma partida antiga em andamento, o aplicativo usa o catálogo atual
e reabre as questões anteriormente puladas como pendentes. Acertos e tentativas
das questões posteriores são preservados; o avanço ignora as que já terminaram.
Isso também funciona depois de salvar e abrir novamente durante a recuperação.
Resultados antigos concluídos permanecem parciais, sem pontos ou senhas
retroativos. O histórico e a Nota Desafio não são apagados.

## Validação

- `npm.cmd test`: 18 testes, incluindo os seis programas completos, pontuação,
  senha, sorteio, ilustrações, correções editoriais e migração de partidas antigas.
- `npx.cmd tsc --noEmit` e `npx.cmd expo lint`.
- Navegador em largura de 390 pixels: primeira questão, imagem, ampliação e resposta.
  A conferência web não substitui a execução em aparelho Android/iOS.

## Catálogo revisado

As letras na coluna Resposta indicam o botão do aplicativo, não a letra da peça
ou do quadro ilustrado.

| Questão | Página PDF | Resposta | Alternativa | Justificativa |
| --- | --- | --- | --- | --- |
| 1 | 5 | A | olhando | Na ilustração da página 5 do PDF, Aladdin está parado, de costas, observando o palácio ao longe. |
| 2 | 5 | D | lado | Abu aparece ao lado de Aladdin na ilustração da página 5 do PDF. |
| 3 | 5 | C | maior | A figura mostra Aladdin com altura e tamanho maiores que os de Abu. |
| 4 | 5 | B | menor | A figura mostra Abu menor que Aladdin. |
| 5 | 5 | D | torres | As construções do palácio têm várias torres com cúpulas. |
| 6 | 5 | A | alto | Na paisagem, as torres do palácio se elevam acima das casas da cidade. |
| 7 | 6 | A | 2 | Contagem no trecho transcrito: duas ocorrências. |
| 8 | 6 | D | 3 | Separação silábica: prin-ce-sa. |
| 9 | 6 | C | príncipe | Par lexical princesa/príncipe. |
| 10 | 6 | B | pensar | Relação lexical pensar/pensativa. |
| 11 | 6 | B | deseja | Equivalência de sentido no trecho: quer/deseja. |
| 12 | 6 | C | bobo | Oposição lexical entre as alternativas. |
| 13 | 6 | D | corpo | Completa a expressão corpo humano. |
| 14 | 6 | D | quatro | 2 × 2 = 4. |
| 15 | 7 | B | coelho | O enunciado informa carnívoro; o coelho é a única alternativa animal. |
| 16 | 7 | D | filhote com listras | O quarto filhote, na alternativa verde, tem as listras características dos tigres. |
| 17 | 7 | B | calmo | O desenho de orelhas erguidas mostra o tigre com expressão tranquila, em contraste com o tigre de dentes expostos da questão seguinte. |
| 18 | 7 | D | atacar | O desenho mostra as orelhas para trás e os dentes expostos: postura de ameaça e ataque. |
| 19 | 7 | A | pelos | Tigres são mamíferos e têm o corpo coberto de pelos. |
| 20 | 7 | B | 10 metros | O zoológico de Edimburgo informa que um tigre pode saltar 10 metros para a frente. Trata-se de distância horizontal, não de altura. |
| 21 | 9 | A | Aladdin | O número 21 da ilustração na página 8 do PDF identifica Aladdin, sentado no tapete. |
| 22 | 9 | B | Jasmine | O número 22 identifica Jasmine, ao lado de Aladdin no tapete. |
| 23 | 9 | D | Gênio | O número 23 identifica o Gênio azul, que ocupa a parte superior da ilustração. |
| 24 | 9 | A | Abu | O número 24 identifica o macaquinho Abu, à direita. |
| 25 | 9 | C | Sultão | O número 25 identifica o Sultão, de barba branca e turbante. |
| 26 | 9 | A | Jafar | O número 26 identifica Jafar, com chapéu alto e traje escuro. |
| 27 | 9 | C | Rajah | O número 27 identifica Rajah, o tigre. |
| 28 | 9 | C | Iago | O número 28 identifica Iago, o papagaio vermelho. |
| 29 | 9 | B | Agrabah | O texto da página 5 situa a história em Agrabah. |
| 30 | 9 | D | As Mil e Uma Noites | Aladdin e a lâmpada maravilhosa é um dos contos associados à coletânea As Mil e Uma Noites. |
| 31 | 11 | A | rei | No contexto da revista, sultão é o título do soberano, equivalente a rei entre as alternativas. |
| 32 | 11 | B | árabes | A seção O mundo árabe, na página 12 do PDF, apresenta os povos árabes e a expansão do império muçulmano. |
| 33 | 11 | A | Bagdá | A página 14 do PDF informa que Bagdá foi o centro mais importante do império muçulmano durante muito tempo. |
| 34 | 11 | B | flauta | À esquerda da ilustração, o músico sopra uma flauta comprida. |
| 35 | 11 | D | tambor | O músico de turbante rosa toca um tambor com as mãos. |
| 36 | 11 | A | alaúde | O músico no centro segura um alaúde, instrumento de cordas com caixa arredondada. |
| 37 | 11 | C | pandeiro | À direita, o músico segura um pandeiro, com pequenas peças metálicas na borda. |
| 38 | 12 | A | beduíno | O número 38 aponta o homem do deserto junto aos camelos; o texto da página o identifica como beduíno. |
| 39 | 12 | C | deserto | O número 39 está na grande paisagem árida e arenosa: o deserto. |
| 40 | 12 | C | duna | O número 40 está sobre uma elevação de areia: uma duna. |
| 41 | 12 | B | oásis | O número 41 aponta a água e as palmeiras em meio ao deserto: um oásis. |
| 42 | 12 | D | tenda | O número 42 está na habitação de tecido armada com cordas: uma tenda. |
| 43 | 12 | D | caravana | O número 43 acompanha o grupo de viajantes e camelos: uma caravana. |
| 44 | 12 | D | camelo | O número 44 aponta os camelos junto à tenda. |
| 45 | 13 | B | alface | Entre os objetos representados, alface começa com AL. |
| 46 | 13 | D | alfinete | Alfinete começa com AL. |
| 47 | 13 | C | almofada | Almofada começa com AL. |
| 48 | 13 | D | alicate | Alicate começa com AL. |
| 49 | 13 | D | alcachofra | Alcachofra começa com AL. |
| 50 | 13 | D | algodão | Algodão começa com AL. |
| 51 | 13 | A | álcool | Álcool começa com AL, desconsiderando o acento. |
| 52 | 14 | C | mesquita | O texto desta página informa que se reuniam nas mesquitas para rezar. |
| 53 | 14 | A | muezin | Muezin é a pessoa que faz o chamado para a oração, representada no alto da torre da página 14 do PDF. |
| 54 | 14 | A | minarete | A torre da mesquita de onde se faz o chamado para a oração é o minarete. |
| 55 | 14 | B | arabescos | Arabescos são os motivos ornamentais associados à decoração dos palácios descritos na atividade. |
| 56 | 14 | C | histórias | O texto descreve o povo em volta dos contadores de histórias. |
| 57 | 14 | A | palácios | O texto informa palácios rodeados de jardins. |
| 58 | 15 | A | 15 | 4+3+8 = 9+5+1 = 2+7+6 = 15. |
| 59 | 15 | B | 15 | 4+9+2 = 3+5+7 = 8+1+6 = 15. |
| 60 | 15 | A | 15 | 4+5+6 = 2+5+8 = 15. |
| 61 | 17 | D | navio à vela | O trecho informa navio e que a viagem foi interrompida quando o vento parou. |
| 62 | 17 | B | vento | O texto relaciona a parada da viagem à falta de vento. |
| 63 | 17 | B | mamíferos | Baleias são mamíferos: respiram por pulmões e amamentam seus filhotes. |
| 64 | 17 | B | baía | O desenho 64 mostra uma entrada do mar na costa, cercada por terra: uma baía. |
| 65 | 17 | C | ilha | O desenho 65 mostra uma porção de terra cercada por água por todos os lados: uma ilha. |
| 66 | 17 | D | recife | O desenho 66 mostra ondas quebrando contra uma formação rochosa à superfície da água: um recife. |
| 67 | 17 | C | cabo | O desenho 67 mostra uma ponta de terra que avança sobre o mar: um cabo. |
| 68 | 18 | D | sereia | A figura combina corpo de mulher e cauda de peixe: uma sereia. |
| 69 | 18 | D | centauro | A figura tem tronco humano e corpo de cavalo: um centauro. |
| 70 | 18 | D | Curupira | O menino de cabelos de fogo e pés voltados para trás representa o Curupira. |
| 71 | 18 | A | dragão | A criatura com asas e fogo saindo da boca é um dragão. |
| 72 | 18 | C | unicórnio | O cavalo branco com um único chifre na testa é um unicórnio. |
| 73 | 18 | A | lobisomem | A figura combina corpo humano vestido e cabeça de lobo: um lobisomem. |
| 74 | 19 | A | D | A peça D continua o contorno cinza e amarelo no canto esquerdo do quebra-cabeça. Encaixe conferido na montagem da figura. |
| 75 | 19 | B | B | A peça B completa a borda branca do ovo e a unha à esquerda na lacuna 75. Encaixe conferido na montagem da figura. |
| 76 | 19 | D | A | A peça A continua o dedo e a unha sobre o ovo branco na lacuna 76. |
| 77 | 19 | B | F | A peça F completa o dedo alaranjado curvado sobre a área branca do ovo na lacuna 77. Encaixe conferido na montagem da figura. |
| 78 | 19 | A | C | A peça C continua o contorno cinza sobre o fundo azul na lacuna 78. Encaixe conferido na montagem da figura. |
| 79 | 19 | D | E | A peça E continua os detalhes da roupa de Simbad e o fundo azul na lacuna 79. |
| 80 | 20 | B | turbante | O texto da atividade menciona o turbante; ele aparece como a segunda opção, amarela. |
| 81 | 20 | B | chinelinho pontudo | O texto introdutório menciona os chinelinhos pontudos. |
| 82 | 20 | D | colete | O colete sem mangas da alternativa verde corresponde ao traje mostrado nas ilustrações da seção. |
| 83 | 20 | D | calça bufante | A quarta figura mostra a calça bufante e os sapatos pontudos da vestimenta apresentada na revista. |
| 84 | 20 | C | personagem com véu | Sherazade é a terceira personagem, com véu, como na ilustração de abertura do Programa 2. |
| 85 | 20 | C | lâmpada a óleo | A terceira figura é a lâmpada a óleo com bico e alça, como a lâmpada mágica mostrada na história. |
| 86 | 20 | B | vaso | O vaso é o único objeto entre as alternativas que já existia na época dos contos; os demais são aparelhos elétricos modernos. |
| 87 | 21 | A | algarismos | A página 15 afirma a origem dos números que usamos; a pista corresponde a algarismos. |
| 88 | 21 | D | Aladdin | O trecho da página 8 conta que Aladdin pegou a lâmpada. |
| 89 | 21 | B | Bagdá | A página 14 apresenta Bagdá como o centro mais importante do império. |
| 90 | 21 | A | Sherazade | A página 11 informa mil e uma noites de histórias de Sherazade. |
| 91 | 23 | D | magro | Oposição lexical gordo/magro. |
| 92 | 23 | B | aberto | Oposição lexical fechado/aberto. |
| 93 | 23 | B | dia | Oposição lexical noite/dia. |
| 94 | 23 | D | reta | Oposição lexical curva/reta. |
| 95 | 23 | C | salgado | Oposição lexical doce/salgado. |
| 96 | 23 | C | limpo | Oposição lexical sujo/limpo. |
| 97 | 23 | C | triste | Oposição lexical alegre/triste. |
| 98 | 23 | B | pequeno | Oposição lexical grande/pequeno. |
| 99 | 24 | A | B | A sequência visual é B, F, A, C, D, E: cortar lenha, ouvir cavalos, esconder-se, ver os sacos descarregados, ouvir a fórmula e ver os ladrões entrarem. O primeiro quadro é B. |
| 100 | 24 | D | F | O segundo quadro é F: Ali Babá interrompe o trabalho e escuta o tropel de cavalos. |
| 101 | 24 | B | A | O terceiro quadro é A: Ali Babá está escondido na árvore. |
| 102 | 24 | A | C | O quarto quadro é C: os cavaleiros descarregam os sacos dos cavalos. |
| 103 | 24 | D | D | O quinto quadro é D: o chefe ergue o braço diante da pedra e diz a fórmula mágica. |
| 104 | 24 | B | E | O sexto quadro é E: os ladrões entram pela abertura da caverna. |
| 105 | 25 | B | caverna | A página 24 informa que os ladrões entraram numa caverna. |
| 106 | 25 | A | sacos | O trecho da página 24 menciona os pesados sacos descarregados. |
| 107 | 25 | B | Fecha-te, Sésamo! | Ao sair da caverna, o chefe manda fechar a entrada: Fecha-te, Sésamo! A fórmula Abre-te, Sésamo! é usada em seguida por Ali Babá para entrar. |
| 108 | 25 | B | cavalos | A página 24 descreve os cavaleiros e seus cavalos. |
| 109 | 25 | D | árvore | A página 24 informa que Ali Babá subiu numa árvore. |
| 110 | 25 | A | tesouro | A continuação diz que encheu o saco de moedas de ouro. |
| 111 | 25 | B | casa | A continuação na página 26 descreve a mulher em casa vendo a riqueza. |
| 112 | 26 | D | balança | A introdução informa que a balança serve para pesar. |
| 113 | 26 | A | balança | A balança é o único instrumento de pesagem entre as opções. |
| 114 | 26 | B | régua | A régua é o instrumento graduado de comprimento entre as opções. |
| 115 | 26 | C | jarra graduada | A jarra desenhada traz marcas de 1 e 2 litros. |
| 116 | 26 | C | termômetro | Termômetro é o instrumento de temperatura entre as opções. |
| 117 | 27 | D | machado | Machado é a ferramenta de corte de lenha entre as opções. |
| 118 | 27 | D | carteira | A carteira desenhada contém cédulas. |
| 119 | 27 | C | banco | O banco é a instituição de guarda de dinheiro entre as opções. |
| 120 | 27 | C | relógio | O relógio é o instrumento de horas entre as opções. |
| 121 | 29 | D | filme | O número 121 aponta a película enrolada no carretel, que contém as imagens do filme. |
| 122 | 29 | D | tela | O número 122 identifica a tela onde a imagem é projetada. |
| 123 | 29 | A | espectadores | O número 123 identifica as pessoas sentadas assistindo ao filme: os espectadores. |
| 124 | 29 | A | projetor | O número 124 está no aparelho de projeção: o projetor. |
| 125 | 29 | C | projecionista | O número 125 identifica a pessoa que opera o projetor: o projecionista. |
| 126 | 29 | D | caixa de som | O número 126 aponta a caixa de som ao lado da tela. |
| 127 | 30 | B | roteirista | Função lexical de roteirista, também identificada na ilustração. |
| 128 | 30 | B | carpinteiros | A ilustração mostra trabalho de carpintaria no cenário. |
| 129 | 30 | D | eletricistas | A função descrita corresponde aos eletricistas entre as opções. |
| 130 | 30 | D | roupas | A função de costura refere-se a roupas. |
| 131 | 30 | B | diretor | A função descrita corresponde ao diretor entre as opções. |
| 132 | 30 | B | câmera | A câmera é o equipamento de filmagem entre as opções. |
| 133 | 30 | D | 28 milhões de dólares | O orçamento registrado pelo Box Office Mojo é de 28 milhões de dólares. A opção original de 35 milhões foi corrigida para que a atividade tenha uma resposta factual. |
| 134 | 30 | A | 3 anos | Em entrevista à Indie Cinema Magazine, o codiretor John Musker informa que a realização de Aladdin levou três anos. |
| 135 | 31 | B | C | A ordem é C, D, B, F, A, E: primeiro vemos apenas a lâmpada no quadro C. |
| 136 | 31 | B | D | O segundo desenho é D: surge uma pequena coluna de fumaça. |
| 137 | 31 | B | B | O terceiro desenho é B: a fumaça cresce antes de formar o Gênio. |
| 138 | 31 | B | F | O quarto desenho é F: o Gênio já tem cabeça, tronco e braços, mas ainda é menor. |
| 139 | 31 | D | A | O quinto desenho é A: o Gênio aparece maior, antes do movimento amplo do último quadro. |
| 140 | 31 | A | E | O sexto desenho é E: o Gênio está completamente formado e abre os braços. |
| 141 | 32 | B | Robin Williams | Robin Williams fez a voz original do Gênio em inglês, conforme a ficha do filme da Disney/D23. |
| 142 | 32 | D | trilha sonora | Alan Menken compôs a trilha sonora de Aladdin; a página apresenta o trabalho de gravação da música. |
| 143 | 32 | D | Todo um Mundo Novo | A Whole New World, conhecida em português como Todo um Mundo Novo, venceu o Oscar de canção original, conforme o registro da Academia de 1993. |
| 144 | 32 | D | músicos | Os instrumentistas à esquerda, indicados pelo número 144, são músicos. |
| 145 | 32 | C | cantora | A mulher com a partitura, marcada 146 na imagem, é a cantora. Os números 145 e 146 foram trocados entre figura e alternativas na revista; o enunciado digital explicita a pessoa correta. |
| 146 | 32 | D | maestro | A pessoa à frente da orquestra, com batuta e marcada 145 na imagem, é o maestro. O enunciado digital corrige a referência numérica trocada na revista. |
| 147 | 33 | C | locadora | Locadora é o estabelecimento de aluguel entre as opções. |
| 148 | 33 | B | televisão | Televisão é o equipamento de reprodução entre as opções. |
| 149 | 33 | B | Disney | A página 29 informa que foi produzido pelos estúdios Disney. |
| 150 | 33 | B | 90 | A ficha oficial da Disney/D23 informa 90 minutos para Aladdin (1992). A alternativa de 84 minutos da revista foi corrigida para 90 minutos. |
