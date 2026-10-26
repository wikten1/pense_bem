import { illustrationFor, type Illustration } from './aladdin-visuals.ts';

export type ChoiceId = 'A' | 'B' | 'C' | 'D';
export interface Question {
  id: string; programId: number; number: number; sourcePage: number;
  prompt: string; options: { id: ChoiceId; text: string; sourceColor: string }[];
  correctId: ChoiceId | null; answerBasis: string | null;
  context?: string; illustration?: Illustration; reviewNotes: string[];
}
// Transcrição visual. A/B/C/D correspondem a vermelho/amarelo/azul/verde.
// Respostas revisadas visualmente no PDF; correções editoriais documentadas em docs/perguntas-e-respostas.md.
const rows = `
1|5|Observe a cena. Aladdin está ...... para o palácio do sultão.|olhando;caminhando;fugindo;conversando|A|Na ilustração da página 5 do PDF, Aladdin está parado, de costas, observando o palácio ao longe.
2|5|O macaquinho Abu está ao ...... .|salto;comendo;corrida;lado|D|Abu aparece ao lado de Aladdin na ilustração da página 5 do PDF.
3|5|Aladdin é ........ do que Abu.|fraco;gordo;maior;menor|C|A figura mostra Aladdin com altura e tamanho maiores que os de Abu.
4|5|Abu é ...... do que Aladdin.|bonito;menor;feio;animal|B|A figura mostra Abu menor que Aladdin.
5|5|O palácio tem muitas ...... .|lanternas;árvores;estrelas;torres|D|As construções do palácio têm várias torres com cúpulas.
6|5|O palácio é mais ...... do que as casas da cidade.|alto;fundo;baixo;aberto|A|Na paisagem, as torres do palácio se elevam acima das casas da cidade.
7|6|No trecho acima, quantas vezes aparece a palavra “palácio”?|2;3;1;nenhuma|A|Contagem no trecho transcrito: duas ocorrências.
8|6|Quantas sílabas tem a palavra “princesa”?|4;8;2;3|D|Separação silábica: prin-ce-sa.
9|6|O masculino de “princesa” é:|rei;feiticeiro;príncipe;sultão|C|Par lexical princesa/príncipe.
10|6|A palavra “pensativa” vem do verbo:|dormir;pensar;chorar;passear|B|Relação lexical pensar/pensativa.
11|6|Qual das palavras abaixo é sinônimo de “quer”?|fala;deseja;faz;compra|B|Equivalência de sentido no trecho: quer/deseja.
12|6|O contrário de “esperto” é:|alto;forte;bobo;gordo|C|Oposição lexical entre as alternativas.
13|6|“Ombro” é uma parte do ........ humano.|céu;sonho;dedo;corpo|D|Completa a expressão corpo humano.
14|6|O dobro de “dois” é:|doze;nove;sete;quatro|D|2 × 2 = 4.
15|7|O tigre é um animal carnívoro. Qual destes ele escolheria para seu almoço?|Primeira opção;Segunda opção;Terceira opção;Quarta opção|B|O enunciado informa carnívoro; o coelho é a única alternativa animal.
16|7|Qual destes é o filhote de tigre?|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|O quarto filhote, na alternativa verde, tem as listras características dos tigres.
17|7|A posição das orelhas indica o humor do tigre. Quando elas estão levantadas, o animal está:|jovem;calmo;gordo;velho|B|O desenho de orelhas erguidas mostra o tigre com expressão tranquila, em contraste com o tigre de dentes expostos da questão seguinte.
18|7|Quando as orelhas estão abaixadas para trás, o tigre está pronto para:|pedalar;dormir;dançar;atacar|D|O desenho mostra as orelhas para trás e os dentes expostos: postura de ameaça e ataque.
19|7|O tigre é um animal coberto de:|pelos;escamas;penas;ossos|A|Tigres são mamíferos e têm o corpo coberto de pelos.
20|7|Quando ataca uma presa, o tigre é capaz de saltar para a frente até:|1 metro;10 metros;3 metros;5 metros|B|O zoológico de Edimburgo informa que um tigre pode saltar 10 metros para a frente. Trata-se de distância horizontal, não de altura.
21|9|Aponte o nome do personagem 21 da história de Aladdin:|Aladdin;Simbad;Ali Babá;Cassim|A|O número 21 da ilustração na página 8 do PDF identifica Aladdin, sentado no tapete.
22|9|Aponte o nome do personagem 22 da história de Aladdin:|Mimosa;Jasmine;Sherazade;Aurora|B|O número 22 identifica Jasmine, ao lado de Aladdin no tapete.
23|9|Aponte o nome do personagem 23 da história de Aladdin:|Jimmy;Lothar;Gigante;Gênio|D|O número 23 identifica o Gênio azul, que ocupa a parte superior da ilustração.
24|9|Aponte o nome do personagem 24 da história de Aladdin:|Abu;Balu;Simão;Ali|A|O número 24 identifica o macaquinho Abu, à direita.
25|9|Aponte o nome do personagem 25 da história de Aladdin:|Rei;Rashid;Sultão;Harum|C|O número 25 identifica o Sultão, de barba branca e turbante.
26|9|Aponte o nome do personagem 26 da história de Aladdin:|Jafar;Califa;Fajar;Rajah|A|O número 26 identifica Jafar, com chapéu alto e traje escuro.
27|9|Aponte o nome do personagem 27 da história de Aladdin:|Tigrão;Bichano;Rajah;Gatão|C|O número 27 identifica Rajah, o tigre.
28|9|Aponte o nome do personagem 28 da história de Aladdin:|Teco;Juca;Iago;Currupaco|C|O número 28 identifica Iago, o papagaio vermelho.
29|9|A história de Aladdin se passa na cidade de:|Istambul;Agrabah;Cashmere;Bagdá|B|O texto da página 5 situa a história em Agrabah.
30|9|Essa história faz parte de um livro muito antigo chamado........ .|Arábia Encantada;O Gênio Malvado;A Lâmpada da Caverna;As Mil e Uma Noites|D|Aladdin e a lâmpada maravilhosa é um dos contos associados à coletânea As Mil e Uma Noites.
31|11|Sultão era o título dado ao ........ no império muçulmano.|rei;soldado;capitão;ladrão|A|No contexto da revista, sultão é o título do soberano, equivalente a rei entre as alternativas.
32|11|O império muçulmano era formado principalmente por povos ........ .|americanos;árabes;russos;cristãos|B|A seção O mundo árabe, na página 12 do PDF, apresenta os povos árabes e a expansão do império muçulmano.
33|11|Naquela época, ........ era a principal cidade do mundo árabe.|Bagdá;Miami;Londres;Tóquio|A|A página 14 do PDF informa que Bagdá foi o centro mais importante do império muçulmano durante muito tempo.
34|11|Qual é o instrumento de sopro tocado pelo músico à esquerda?|corneta;flauta;martelo;saxofone|B|À esquerda da ilustração, o músico sopra uma flauta comprida.
35|11|Qual é o instrumento de percussão tocado pelo músico de turbante rosa?|harpa;castanhola;bateria;tambor|D|O músico de turbante rosa toca um tambor com as mãos.
36|11|Qual é o instrumento de cordas no colo do músico ao centro?|alaúde;violão;violino;piano|A|O músico no centro segura um alaúde, instrumento de cordas com caixa arredondada.
37|11|Qual é o instrumento circular segurado pelo músico à direita?|reco-reco;cuíca;pandeiro;tamborim|C|À direita, o músico segura um pandeiro, com pequenas peças metálicas na borda.
38|12|Identifique a figura do mundo árabe 38.|beduíno;guerreiro;caubói;índio|A|O número 38 aponta o homem do deserto junto aos camelos; o texto da página o identifica como beduíno.
39|12|Identifique a figura do mundo árabe 39.|praia;floresta;deserto;campo|C|O número 39 está na grande paisagem árida e arenosa: o deserto.
40|12|Identifique a figura do mundo árabe 40.|ilha;savana;duna;mar|C|O número 40 está sobre uma elevação de areia: uma duna.
41|12|Identifique a figura do mundo árabe 41.|praça;oásis;aldeia;cidade|B|O número 41 aponta a água e as palmeiras em meio ao deserto: um oásis.
42|12|Identifique a figura do mundo árabe 42.|oca;casa;palácio;tenda|D|O número 42 está na habitação de tecido armada com cordas: uma tenda.
43|12|Identifique a figura do mundo árabe 43.|multidão;procissão;fileira;caravana|D|O número 43 acompanha o grupo de viajantes e camelos: uma caravana.
44|12|Identifique a figura do mundo árabe 44.|elefante;cavalo;alce;camelo|D|O número 44 aponta os camelos junto à tenda.
45|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|B|Entre os objetos representados, alface começa com AL.
46|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|Alfinete começa com AL.
47|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|C|Almofada começa com AL.
48|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|Alicate começa com AL.
49|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|Alcachofra começa com AL.
50|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|Algodão começa com AL.
51|13|Descubra em cada linha o objeto cujo nome começa com AL.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|A|Álcool começa com AL, desconsiderando o acento.
52|14|O lugar onde os muçulmanos rezam se chama ........ .|capela;igreja;mesquita;sinagoga|C|O texto desta página informa que se reuniam nas mesquitas para rezar.
53|14|O ...... é o homem que chama o povo para rezar.|muezin;homenzinho;cantador;sacristão|A|Muezin é a pessoa que faz o chamado para a oração, representada no alto da torre da página 14 do PDF.
54|14|Ele canta bem no alto de um ........ .|minarete;elevador;prédio;obelisco|A|A torre da mesquita de onde se faz o chamado para a oração é o minarete.
55|14|Os palácios de Bagdá eram ricamente decorados com ........ .|chocolate;arabescos;cartazes;anúncios|B|Arabescos são os motivos ornamentais associados à decoração dos palácios descritos na atividade.
56|14|Nas feiras, o povo gostava de ouvir ........ .|rádio;televisão;histórias;discos|C|O texto descreve o povo em volta dos contadores de histórias.
57|14|Os sultões moravam em ...... cercados de jardins.|palácios;favelas;casebres;apartamentos|A|O texto informa palácios rodeados de jardins.
58|15|Somando os três algarismos de cada coluna vertical dá:|15;9;12;7|A|4+3+8 = 9+5+1 = 2+7+6 = 15.
59|15|Somando os três algarismos de cada linha horizontal dá:|19;15;8;13|B|4+9+2 = 3+5+7 = 8+1+6 = 15.
60|15|Somando três algarismos na diagonal dá:|15;6;13;14|A|4+5+6 = 2+5+8 = 15.
61|17|Em que tipo de embarcação Simbad viajou para as Índias?|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|O trecho informa navio e que a viagem foi interrompida quando o vento parou.
62|17|Esse navio era movido pelo........ .|motor;vento;jato;álcool|B|O texto relaciona a parada da viagem à falta de vento.
63|17|As baleias são........ .|peixes;mamíferos;répteis;insetos|B|Baleias são mamíferos: respiram por pulmões e amamentam seus filhotes.
64|17|Qual é o nome do acidente geográfico 64?|arquipélago;baía;montanha;continente|B|O desenho 64 mostra uma entrada do mar na costa, cercada por terra: uma baía.
65|17|Qual é o nome do acidente geográfico 65?|lagoa;cabo;ilha;promontório|C|O desenho 65 mostra uma porção de terra cercada por água por todos os lados: uma ilha.
66|17|Qual é o nome do acidente geográfico 66?|lago;enseada;vale;recife|D|O desenho 66 mostra ondas quebrando contra uma formação rochosa à superfície da água: um recife.
67|17|Qual é o nome do acidente geográfico 67?|cordilheira;ilha;cabo;golfo|C|O desenho 67 mostra uma ponta de terra que avança sobre o mar: um cabo.
68|18|Identifique o animal lendário 68.|náiade;peixe-moça;fada;sereia|D|A figura combina corpo de mulher e cauda de peixe: uma sereia.
69|18|Identifique o animal lendário 69.|jóquei;atleta;fauno;centauro|D|A figura tem tronco humano e corpo de cavalo: um centauro.
70|18|Identifique o animal lendário 70.|Cuca;Cobra-grande;Boitatá;Curupira|D|O menino de cabelos de fogo e pés voltados para trás representa o Curupira.
71|18|Identifique o animal lendário 71.|dragão;lagartão;peixe-boi;dinossauro|A|A criatura com asas e fogo saindo da boca é um dragão.
72|18|Identifique o animal lendário 72.|pégaso;rinoceronte;unicórnio;cavalo-marinho|C|O cavalo branco com um único chifre na testa é um unicórnio.
73|18|Identifique o animal lendário 73.|lobisomem;morcego;logo-guará;vampiro|A|A figura combina corpo humano vestido e cabeça de lobo: um lobisomem.
74|19|Complete o quebra-cabeça com a peça correspondente ao lugar 74.|D;A;C;B|A|A peça D continua o contorno cinza e amarelo no canto esquerdo do quebra-cabeça. Encaixe conferido na montagem da figura.
75|19|Complete o quebra-cabeça com a peça correspondente ao lugar 75.|A;B;C;F|B|A peça B completa a borda branca do ovo e a unha à esquerda na lacuna 75. Encaixe conferido na montagem da figura.
76|19|Complete o quebra-cabeça com a peça correspondente ao lugar 76.|D;E;C;A|D|A peça A continua o dedo e a unha sobre o ovo branco na lacuna 76.
77|19|Complete o quebra-cabeça com a peça correspondente ao lugar 77.|B;F;E;D|B|A peça F completa o dedo alaranjado curvado sobre a área branca do ovo na lacuna 77. Encaixe conferido na montagem da figura.
78|19|Complete o quebra-cabeça com a peça correspondente ao lugar 78.|C;D;A;B|A|A peça C continua o contorno cinza sobre o fundo azul na lacuna 78. Encaixe conferido na montagem da figura.
79|19|Complete o quebra-cabeça com a peça correspondente ao lugar 79.|F;B;C;E|D|A peça E continua os detalhes da roupa de Simbad e o fundo azul na lacuna 79.
80|20|Em cada linha, aponte a peça que faz parte da vestimenta árabe.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|B|O texto da atividade menciona o turbante; ele aparece como a segunda opção, amarela.
81|20|Em cada linha, aponte a peça que faz parte da vestimenta árabe.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|B|O texto introdutório menciona os chinelinhos pontudos.
82|20|Em cada linha, aponte a peça que faz parte da vestimenta árabe.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|O colete sem mangas da alternativa verde corresponde ao traje mostrado nas ilustrações da seção.
83|20|Em cada linha, aponte a peça que faz parte da vestimenta árabe.|Primeira opção;Segunda opção;Terceira opção;Quarta opção|D|A quarta figura mostra a calça bufante e os sapatos pontudos da vestimenta apresentada na revista.
84|20|Qual destas é Sherazade?|Primeira opção;Segunda opção;Terceira opção;Quarta opção|C|Sherazade é a terceira personagem, com véu, como na ilustração de abertura do Programa 2.
85|20|Qual é a lâmpada de Aladdin?|Primeira opção;Segunda opção;Terceira opção;Quarta opção|C|A terceira figura é a lâmpada a óleo com bico e alça, como a lâmpada mágica mostrada na história.
86|20|Qual destes objetos era usado no tempo das Mil e Uma Noites?|Primeira opção;Segunda opção;Terceira opção;Quarta opção|B|O vaso é o único objeto entre as alternativas que já existia na época dos contos; os demais são aparelhos elétricos modernos.
87|21|Foram inventados pelos árabes e servem para contar.|algarismos;letras;calculadoras;máquinas|A|A página 15 afirma a origem dos números que usamos; a pista corresponde a algarismos.
88|21|Ele encontrou uma lâmpada mágica.|Sim-Sala Bim;Simbad;Ali Babá;Aladdin|D|O trecho da página 8 conta que Aladdin pegou a lâmpada.
89|21|A principal cidade do império árabe.|Teerã;Bagdá;Egito;Marrocos|B|A página 14 apresenta Bagdá como o centro mais importante do império.
90|21|Ela contou mais de mil histórias.|Sherazade;Cinderela;Dinazarde;Dona Benta|A|A página 11 informa mil e uma noites de histórias de Sherazade.
91|23|Assinale a resposta que tem sentido oposto: GORDO.|quadrado;alto;loiro;magro|D|Oposição lexical gordo/magro.
92|23|Assinale a resposta que tem sentido oposto: FECHADO.|pequeno;aberto;dourado;baixo|B|Oposição lexical fechado/aberto.
93|23|Assinale a resposta que tem sentido oposto: NOITE.|azul;dia;grande;curto|B|Oposição lexical noite/dia.
94|23|Assinale a resposta que tem sentido oposto: CURVA.|curta;fácil;magra;reta|D|Oposição lexical curva/reta.
95|23|Assinale a resposta que tem sentido oposto: DOCE.|torto;bonito;salgado;largo|C|Oposição lexical doce/salgado.
96|23|Assinale a resposta que tem sentido oposto: SUJO.|estreito;jovem;limpo;rico|C|Oposição lexical sujo/limpo.
97|23|Assinale a resposta que tem sentido oposto: ALEGRE.|feio;alto;triste;claro|C|Oposição lexical alegre/triste.
98|23|Assinale a resposta que tem sentido oposto: GRANDE.|comprido;pequeno;colorido;difícil|B|Oposição lexical grande/pequeno.
99|24|O 1º quadrinho é:|B;D;C;A|A|A sequência visual é B, F, A, C, D, E: cortar lenha, ouvir cavalos, esconder-se, ver os sacos descarregados, ouvir a fórmula e ver os ladrões entrarem. O primeiro quadro é B.
100|24|O 2º quadrinho é:|A;C;B;F|D|O segundo quadro é F: Ali Babá interrompe o trabalho e escuta o tropel de cavalos.
101|24|O 3º quadrinho é:|C;A;B;D|B|O terceiro quadro é A: Ali Babá está escondido na árvore.
102|24|O 4º quadrinho é:|C;B;A;D|A|O quarto quadro é C: os cavaleiros descarregam os sacos dos cavalos.
103|24|O 5º quadrinho é:|C;B;A;D|D|O quinto quadro é D: o chefe ergue o braço diante da pedra e diz a fórmula mágica.
104|24|O 6º quadrinho é:|F;E;D;C|B|O sexto quadro é E: os ladrões entram pela abertura da caverna.
105|25|Depois de algum tempo, os ladrões saíram da ...... com os sacos vazios.|chuva;caverna;praia;cadeia|B|A página 24 informa que os ladrões entraram numa caverna.
106|25|Depois de algum tempo, os ladrões saíram da caverna com os ...... vazios.|sacos;bolsas;copos;mãos|A|O trecho da página 24 menciona os pesados sacos descarregados.
107|25|O chefe ficou na frente da pedra e gritou ...... .|Sim-sala-bin!;Fecha-te, Sésamo!;Abra cadabra!;Encolhe, Sésamo!|B|Ao sair da caverna, o chefe manda fechar a entrada: Fecha-te, Sésamo! A fórmula Abre-te, Sésamo! é usada em seguida por Ali Babá para entrar.
108|25|Os ladrões montaram nos ...... e foram embora a galope.|camelos;cavalos;elefantes;motos|B|A página 24 descreve os cavaleiros e seus cavalos.
109|25|Só então Ali Babá desceu da ......, chegou perto da pedra e gritou: Abre-te, Sésamo!|bicicleta;escada;gruta;árvore|D|A página 24 informa que Ali Babá subiu numa árvore.
110|25|Quando a gruta se abriu, Ali Babá entrou e viu um grande ......!|tesouro;monstro;feiticeiro;sultão|A|A continuação diz que encheu o saco de moedas de ouro.
111|25|Mais que depressa encheu de moedas de ouro o saco que tinha trazido para a lenha e voltou correndo para sua ...... .|árvore;casa;cidade;mulher|B|A continuação na página 26 descreve a mulher em casa vendo a riqueza.
112|26|Em cada linha, aponte o objeto que serve para... Pesar alimentos:|panela;xícara;liquidificador;balança|D|A introdução informa que a balança serve para pesar.
113|26|Pesar pessoas:|balança;bomba de combustível;televisão;rádio|A|A balança é o único instrumento de pesagem entre as opções.
114|26|Medir o comprimento:|compasso;régua;apontador;alicate|B|A régua é o instrumento graduado de comprimento entre as opções.
115|26|Medir líquidos:|chupeta;fita métrica;jarra graduada;folha|C|A jarra desenhada traz marcas de 1 e 2 litros.
116|26|Medir temperatura:|lanterna;estetoscópio;termômetro;lâmpada|C|Termômetro é o instrumento de temperatura entre as opções.
117|27|Cortar lenha:|garfo;martelo;tesoura;machado|D|Machado é a ferramenta de corte de lenha entre as opções.
118|27|Carregar dinheiro:|chapéu;bolsa com telefone;sapato;carteira|D|A carteira desenhada contém cédulas.
119|27|Guardar dinheiro:|igreja;hospital;banco;zoológico|C|O banco é a instituição de guarda de dinheiro entre as opções.
120|27|Saber as horas:|óculos;colar;relógio;isqueiro|C|O relógio é o instrumento de horas entre as opções.
121|29|Aponte o nome correto da figura 121.|fita;roda;tira;filme|D|O número 121 aponta a película enrolada no carretel, que contém as imagens do filme.
122|29|Aponte o nome correto da figura 122.|quadro;lençol;parede;tela|D|O número 122 identifica a tela onde a imagem é projetada.
123|29|Aponte o nome correto da figura 123.|espectadores;passageiros;amigos;animais|A|O número 123 identifica as pessoas sentadas assistindo ao filme: os espectadores.
124|29|Aponte o nome correto da figura 124.|projetor;câmera;elevador;microfone|A|O número 124 está no aparelho de projeção: o projetor.
125|29|Aponte o nome correto da figura 125.|bilheteiro;lanterninha;projecionista;público|C|O número 125 identifica a pessoa que opera o projetor: o projecionista.
126|29|Aponte o nome correto da figura 126.|televisão;luminária;cinzeiro;caixa de som|D|O número 126 aponta a caixa de som ao lado da tela.
127|30|O ...... escreve a história do filme.|médico;roteirista;jornalista;fotógrafo|B|Função lexical de roteirista, também identificada na ilustração.
128|30|Os ...... montam os cenários.|advogados;carpinteiros;soldados;bombeiros|B|A ilustração mostra trabalho de carpintaria no cenário.
129|30|Os ...... cuidam da iluminação.|encanadores;lixeiros;pedreiros;eletricistas|D|A função descrita corresponde aos eletricistas entre as opções.
130|30|Os figurinistas e costureiros fazem as ...... .|almoço;cócegas;malas;roupas|D|A função de costura refere-se a roupas.
131|30|O ...... diz aos atores como devem representar.|professor;diretor;técnico;juiz|B|A função descrita corresponde ao diretor entre as opções.
132|30|O diretor de fotografia filma tudo com a ...... .|mão;câmera;batedeira;tesoura|B|A câmera é o equipamento de filmagem entre as opções.
133|30|Quanto custou a produção de Aladdin?|10 milhões de dólares;1 bilhão de dólares;20 mil dólares;28 milhões de dólares|D|O orçamento registrado pelo Box Office Mojo é de 28 milhões de dólares. A opção original de 35 milhões foi corrigida para que a atividade tenha uma resposta factual.
134|30|Quanto tempo demorou a produção do filme?|3 anos;2 dias;1 mês;3 horas|A|Em entrevista à Indie Cinema Magazine, o codiretor John Musker informa que a realização de Aladdin levou três anos.
135|31|O 1º desenho é:|B;C;A;D|B|A ordem é C, D, B, F, A, E: primeiro vemos apenas a lâmpada no quadro C.
136|31|O 2º desenho é:|F;D;A;E|B|O segundo desenho é D: surge uma pequena coluna de fumaça.
137|31|O 3º desenho é:|A;B;C;D|B|O terceiro desenho é B: a fumaça cresce antes de formar o Gênio.
138|31|O 4º desenho é:|A;F;B;C|B|O quarto desenho é F: o Gênio já tem cabeça, tronco e braços, mas ainda é menor.
139|31|O 5º desenho é:|D;F;B;A|D|O quinto desenho é A: o Gênio aparece maior, antes do movimento amplo do último quadro.
140|31|O 6º desenho é:|E;C;A;F|A|O sexto desenho é E: o Gênio está completamente formado e abre os braços.
141|32|Um ator muito famoso fez a voz do Gênio. Quem é ele?|Arnold Schwarzenegger;Robin Williams;Rambo;Tom Cruise|B|Robin Williams fez a voz original do Gênio em inglês, conforme a ficha do filme da Disney/D23.
142|32|Alan Menken compôs a ...... de Aladdin.|história;cor;roupa;trilha sonora|D|Alan Menken compôs a trilha sonora de Aladdin; a página apresenta o trabalho de gravação da música.
143|32|Qual é o nome da canção premiada do filme?|O Gênio e a Fumaça;A Caverna dos Horrores;A Bruxa Malvada;Todo um Mundo Novo|D|A Whole New World, conhecida em português como Todo um Mundo Novo, venceu o Oscar de canção original, conforme o registro da Academia de 1993.
144|32|O desenho mostra uma orquestra tocando no estúdio de gravação. O que indica o número 144?|flores;livros;bonecos;músicos|D|Os instrumentistas à esquerda, indicados pelo número 144, são músicos.
145|32|Qual é a função da mulher com a partitura, marcada 146 no desenho?|médicos;pintores;cantora;soldados|C|A mulher com a partitura, marcada 146 na imagem, é a cantora. Os números 145 e 146 foram trocados entre figura e alternativas na revista; o enunciado digital explicita a pessoa correta.
146|32|Qual é a função da pessoa com a batuta, marcada 145 no desenho?|bailarino;fotógrafo;diretor;maestro|D|A pessoa à frente da orquestra, com batuta e marcada 145 na imagem, é o maestro. O enunciado digital corrige a referência numérica trocada na revista.
147|33|Para alugar uma fita de vídeo vamos à ...... .|igreja;padaria;locadora;feira|C|Locadora é o estabelecimento de aluguel entre as opções.
148|33|As imagens gravadas na fita de vídeo aparecem na tela da ...... .|janela;televisão;microondas;parede|B|Televisão é o equipamento de reprodução entre as opções.
149|33|O filme Aladdin, que teve 5 indicações para o Oscar, foi produzido nos estúdios ...... .|Metro;Disney;Universal;Togo|B|A página 29 informa que foi produzido pelos estúdios Disney.
150|33|Aladdin tem ...... minutos de duração.|380;90;20;15|B|A ficha oficial da Disney/D23 informa 90 minutos para Aladdin (1992). A alternativa de 84 minutos da revista foi corrigida para 90 minutos.
`;


function range(a:number,b:number) { return Array.from({length:b-a+1},(_,i)=>a+i); }
const illustratedOptions = new Set([...range(112,120)]);
export const questions: Question[] = rows.trim().split('\n').map(row => {
  const [n,p,prompt,choices,answer,basis] = row.split('|');
  const number = Number(n);
  const notes: string[] = [];

  if ([15,16,45,46,47,48,49,50,51,61,80,81,82,83,84,85,86].includes(number)) notes.push('Alternativas associadas à imagem pelas cores vermelho, amarelo, azul e verde, nessa ordem.');
  if (illustratedOptions.has(number)) notes.push('Adaptação digital: alternativas ilustradas transcritas como descrições textuais, na ordem das cores.');
  if ([21,22,23,24,25,26,27,28,34,35,36,37,38,39,40,41,42,43,44,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,121,122,123,124,125,126,144,145,146].includes(number)) notes.push('Enunciado compartilhado da página individualizado para indicar o número da figura.');
  if ([105,106,107,108,109,110,111].includes(number)) notes.push('Trecho com pictogramas convertido em lacuna textual.');
  if (number>=91&&number<=98) notes.push('Adaptação digital: a palavra impressa sob a figura foi integrada ao enunciado.');
  if (number === 73) notes.push('Preservado “logo-guará”, aparente erro tipográfico da revista.');
  if (number === 142) notes.push('Nome do compositor corrigido de Allan para Alan Menken.');
  if ([145,146].includes(number)) notes.push('Referência corrigida: a cantora está marcada 146 e o maestro, 145 na figura original.');
  if ([133,150].includes(number)) notes.push('Alternativa corrigida na adaptação digital; confira a justificativa e o registro em docs/perguntas-e-respostas.md.');
  return {id:`aladdin-${number}`,programId:Math.ceil(number/30),number,sourcePage:Number(p),prompt,
    options:choices.split(';').map((text,i)=>({id:'ABCD'[i] as ChoiceId,text,sourceColor:['vermelho','amarelo','azul','verde'][i]})),
    correctId:(answer || null) as ChoiceId|null, answerBasis:basis||null,context:contextFor(number),illustration:illustrationFor(number),reviewNotes:notes};
});
function contextFor(n:number): string|undefined {
  if(n >= 99 && n <= 104) return 'Coloque os quadros na ordem dos acontecimentos: Ali Babá cortava lenha quando ouviu cavalos. Escondeu-se numa árvore. Os cavaleiros descarregaram os sacos, o chefe disse a fórmula mágica e os ladrões entraram na caverna. Escolha a letra do quadro que ocupa a posição pedida.';
  if(n >= 135 && n <= 140) return 'Ordene os desenhos desde a lâmpada sozinha até o Gênio completamente formado, abrindo os braços. Escolha a letra do quadro que ocupa a posição pedida.';
  if(n >= 74 && n <= 79) return 'Observe os contornos da figura e das peças A a F. Qual peça completa a lacuna indicada? As letras das peças são diferentes das letras dos botões de resposta.';
  if(n === 7) return 'No jardim do palácio, a princesa Jasmine passa os dias triste e pensativa. Seu pai quer que ela se case com um príncipe, mas Jasmine não gosta de nenhum dos candidatos. Ela quer se casar por amor, e está cansada de viver fechada no palácio. Por isso, resolve fugir pulando o muro do jardim. Na cidade, Jasmine passeia pelo mercado e encontra um garoto muito esperto, com um macaquinho empoleirado no ombro. Você já adivinhou quem é, não é mesmo? Pois é, Jasmine encontra Aladdin e os dois acabam apaixonados...';
  if(n === 29) return 'Há muito tempo, no misterioso Oriente, a cidade de Agrabah era governada por um bondoso sultão. Ele vivia num rico palácio com sua filha, a princesa Jasmine, e nem desconfiava que seu reino estava em perigo.';
  if(n >= 52 && n <= 57) return 'Durante muito tempo, a cidade de Bagdá foi o centro mais importante do império muçulmano. Lá viviam sultões e califas, em palácios maravilhosos rodeados de jardins e fontes. Havia centenas de mesquitas, onde os muçulmanos se reuniam para rezar. Os astrônomos estudavam as estrelas, os sábios escreviam livros, e o povo se reunia em volta dos contadores de histórias, que conheciam muitas fábulas e lendas.';
  if(n >= 58 && n <= 60) return 'Quadrado mágico (linhas de cima para baixo):\n4   9   2\n3   5   7\n8   1   6';
  if(n === 61 || n === 62) return 'Um dia o marinheiro Simbad embarcou num navio que levava mercadorias para as Índias. No meio da viagem, o vento parou de soprar. Simbad e seus companheiros resolveram ir até uma ilha próxima para descansar da viagem.';
  if(n >= 105 && n <= 111) return 'Ali Babá estava no bosque quando ouviu um tropel de cavalos. Subiu numa árvore e ficou escondido. Chegaram quarenta cavaleiros, que descarregaram pesados sacos da garupa dos cavalos. O chefe gritou: Abre-te, Sésamo! A pedra se abriu e os ladrões entraram na caverna.\n\nAdaptação textual de apoio da página anterior; os pictogramas desta atividade foram convertidos em lacunas.';
  return undefined;
}
export const programNames = ['Aladdin e seus amigos','As Mil e Uma Noites','As aventuras de Simbad','Ali Babá e os quarenta ladrões','A magia do cinema','Revisão geral'];
export const programs = programNames.map((title,i)=>({id:i+1,title,code:`04${i+1}`,description:i===5?'6 questões de cada programa, escolhidas ao acaso.':`Questões ${i*30+1} a ${(i+1)*30}, na sequência da revista.`,questions:i===5?[]:questions.filter(q=>q.programId===i+1)}));
