# Análise e otimização do Pense Bem

Data: 16/11/2026. Escopo: código em `src`, rotas, conteúdo, persistência, mídia, dependências, configuração, testes e ferramentas de desenvolvimento. As pastas nativas geradas e os originais de arte foram preservados.

## Diagnóstico e prioridades

| Problema encontrado | Impacto | Solução implementada |
| --- | --- | --- |
| PNGs grandes nas perguntas e fundos | Distribuição e transferência de recursos maiores | 41 derivados WebP sem perdas, com comparação dos pixels decodificados |
| Importação do índice de fontes | Incluía seis pesos Cinzel; a interface utiliza três | Importações diretas dos três pesos utilizados |
| Dependências e componentes do exemplo inicial | Mais código para manter e módulos opcionais no build | Remoção do conjunto de exemplos sem consumidores e de quatro dependências |
| Conteúdo completo das perguntas serializado a cada ação | Repetição de enunciados, alternativas e ilustrações no armazenamento | Formato compacto com IDs, ordem, tentativas e metadados da sessão |
| Histórico e contribuições da Nota Desafio aceitos sem validação | Dados locais inconsistentes poderiam quebrar a tela ou alterar totais | Validação dos resultados e reconstrução da Nota Desafio a partir das senhas |
| Histórico renderizado integralmente com `ScrollView` | Quantidade de componentes montados crescia com todas as partidas | `FlatList` e componente de item separado, preservando todas as partidas |
| Cálculo da melhor pontuação repetia filtros e alocava arrays | Trabalho repetido para cada programa | Índice por programa, recalculado somente quando o histórico muda |
| Ações recusadas ainda criavam novos objetos de estado | Renderizações e gravações sem mudança de progresso | Retorno do mesmo estado nas operações sem efeito |
| Aplausos ignoravam o silêncio e tocavam junto da música | Preferência de áudio desrespeitada | Preferência compartilhada e suspensão temporária da música na celebração |
| Vídeos decorativos não acompanhavam explicitamente o estado do app | Reprodução desnecessária fora do primeiro plano | Pausa por estado do aplicativo, mantendo a pausa por foco da rota |
| Modal de imagem permanecia na árvore mesmo fechado | Conteúdo ampliado construído antecipadamente | Montagem apenas quando aberto |
| `.easignore` excluía `musica 08.mp3`, utilizada no treino | Arquivo disponível localmente poderia faltar no build em nuvem | Correção da exclusão |
| Dependências fora das versões recomendadas | Incompatibilidades potenciais e alertas de segurança | Alinhamento pelo CLI do Expo e correções de segurança sem `--force` |
| README e comando de reset ainda pertenciam ao exemplo | Orientações incorretas e comando capaz de apagar o aplicativo | Documentação específica e remoção do reset obsoleto |

## Arquitetura e fluxos

A separação existente era adequada para o porte do projeto e foi mantida. `src/app` contém as seis rotas/layouts; `src/content` contém a revista e as associações visuais; `src/game` concentra as regras; `src/state` integra React e estado; `src/storage` trata leitura/escrita; `src/services` contém reprodução de efeitos e download do livro; `src/theme/tokens.ts` continua sendo o design system.

O fluxo segue início → programas → quiz → resultado; histórico e resgate de senhas permanecem disponíveis. O programa 6 continua sorteando seis perguntas de cada programa anterior, com a mesma semente ao retomar. O treino continua separado da revista e sem gerar senha.

`src/storage/game-save.ts` agora concentra o contrato de persistência, a migração por leitura dos registros anteriores, a validação e a construção de resultados. A chave de armazenamento foi mantida. O formato novo omite conteúdo imutável e totais de tentativas derivados; ao ler, o catálogo atual e as regras recompõem a sessão. A ordem das questões, tentativas incorretas, acertos, pendências históricas e senhas resgatadas são preservadas. `ledger.byProgram` continua no arquivo para compatibilidade com os leitores anteriores, mas não é usado como fonte confiável de pontuação pelo novo leitor.

Quando o registro é inválido, sua leitura falha e a escrita fica desativada para preservar o original. A interface informa esse estado. Não há truncamento do histórico. As gravações continuam ordenadas e sem debounce que adie a persistência do progresso.

Não há cliente de API remoto, autenticação ou backend no código do aplicativo. A única chamada `fetch` própria prepara o PDF local na web. Não foi introduzida uma camada de cache de rede. O projeto já tinha um player musical por faixa ativa, players compartilhados para os efeitos, imagens locais, React Compiler habilitado e divisão de rotas na web; essas escolhas foram mantidas. Não foram adicionadas bibliotecas de estado ou memoizações indiscriminadas.

## Arquivos e estruturas alterados

- Estado e persistência: `src/state/GameProvider.tsx`, `src/state/AudioProvider.tsx`, novo `src/storage/game-save.ts` e validação adicional da semente em `src/game/rules.ts`.
- Ciclo de vida de mídia: novo `src/hooks/use-app-active.ts`, `src/components/app-music.tsx`, `completion-video.tsx`, `intro-background.tsx` e `startup-video.tsx`.
- Telas: `_layout.tsx`, `index.tsx`, `programs.tsx`, `history.tsx` e `results/[programId].tsx`.
- Componentes: `src/components/game/history-entry.tsx`, `question-illustration.tsx`, `program-screen.tsx` e remoção do fundo estático sem chamadas em `ui.tsx`.
- Mensagens: novo `src/game/password-feedback.ts`, compartilhado pelo histórico e pelo resultado.
- Ferramentas: novos `scripts/optimize-runtime-images.mjs` e `scripts/measure-optimization.mjs`; novo `tests/game-save.test.mjs`; scripts de checagem em `package.json`.
- Recursos: 41 arquivos `*.lossless.webp`. Os PNGs de origem e os WebPs editoriais preexistentes permanecem preservados. O processo editorial anterior continua separado desses derivados.
- Configuração/documentação: `package.json`, `package-lock.json`, `app.json`, `.easignore`, `.gitignore`, `README.md`, este relatório e os JSONs de métricas.
- Removidos por ausência de consumidores: `animated-icon` nativo/web/CSS, `external-link`, `hint-row`, `themed-text`, `themed-view`, `web-badge`, `ui/collapsible`, `constants/theme`, hooks de tema/cor do exemplo, `global.css` e `scripts/reset-project.js`.

## Interface e acessibilidade

As cores, os três pesos de fonte utilizados, as imagens, os vídeos e os fundos ativos foram preservados. A compressão não redimensiona as imagens. Os elementos ampliados continuam disponíveis e as senhas agora permitem seleção do texto.

Foram acrescentados estados de recuperação de progresso e bloqueio de ações antes da hidratação, mensagens de erro de persistência no início/histórico, envio pelo teclado no resgate e anúncios acessíveis para o retorno das operações. O resultado agora informa quando uma senha não aumenta a Nota Desafio, em vez de ignorar silenciosamente o retorno. A celebração ganhou acesso direto a “Ver resultado”, permitindo sair caso o navegador bloqueie a reprodução.

## Medições reais

Os valores exatos e as sessões de referência estão em [optimization-metrics.json](optimization-metrics.json). Os detalhes de cada imagem estão em [runtime-images.json](runtime-images.json).

| Medida | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| 41 imagens, bytes | 62.008.845 | 33.814.888 | 45,5% |
| Recursos do export Android, bytes | 189.006.165 | 158.014.232 | 16,4% |
| Bundle Hermes Android, bytes | 4.326.209 | 4.077.657 | 5,7% |
| Fontes incluídas, bytes | 1.432.680 | 230.712 | 83,9% |
| Quantidade de fontes incluídas | 7 | 3 | 4 arquivos |
| Salvamento inicial do programa 1, bytes | 21.145 | 2.435 | 88,5% |

Os recursos do export diminuíram em 30.991.933 bytes (aproximadamente 31,0 MB decimais). Os percentuais são derivados dos tamanhos medidos, arredondados a uma casa decimal.

A comparação usa arquivos sem compressão de exports Android em produção e os caminhos únicos de `metadata.json`. A exportação inicial usou `--platform android`; a final inclui Android, iOS e web, e a comparação seleciona somente Android nos dois casos. Não se compara o tamanho total das pastas, que incluiria recursos de outras plataformas e arquivos de servidor.

As sessões de referência são novas partidas com semente 123 e histórico/Nota Desafio vazios. Conforme o histórico cresce, ele continua contribuindo para o tamanho de cada salvamento; a redução medida para uma sessão nova não representa automaticamente a redução de todos os registros reais.

Estas medidas não são o tamanho de APK/AAB/IPA instalado. Não foram medidos tempo de inicialização, FPS, consumo de bateria ou memória em aparelho. Tempos de execução do Metro não foram apresentados como ganhos de desempenho do aplicativo.

## Dependências e segurança

Removidas: `@expo/ui`, `expo-device`, `expo-symbols` e `expo-web-browser`, sem utilização nos fluxos ativos. Dependências necessárias ao Router, à renderização, aos efeitos e às ferramentas de arte foram mantidas, inclusive os pares de navegação/animação.

O SDK permanece em 58; `expo` passou de 58.0.16 para 58.0.25 e React Native de 0.88.0 para 0.88.1. O CLI alinhou os demais módulos: audio, asset, constants, dev-client, font, glass-effect, image, linking, router, sharing, splash-screen, status-bar, system-ui, video, safe-area-context e screens. Algumas faixas compatíveis de `package.json` permaneceram iguais; as versões efetivamente resolvidas estão no lockfile. Os plugins de image/status-bar foram acrescentados automaticamente pelo instalador do Expo.

A auditoria inicial informou 19 pacotes afetados: 3 altos, 15 moderados e 1 baixo. Após o alinhamento e `npm audit fix` sem `--force`, restam 8 alertas moderados associados a `minimatch` e seus dependentes nas ferramentas Expo/fingerprint/TypeScript ESLint. Não restam alertas altos ou críticos na auditoria executada. Isso não equivale a uma certificação de ausência de vulnerabilidades. A correção forçada oferecida para a cadeia do Expo sugeria downgrade para SDK 52; ela não foi aplicada por comprometer a compatibilidade.

As senhas do jogo continuam sendo códigos de pontuação locais com verificador, conforme a regra já documentada. Não foram transformadas em credenciais de autenticação nem tratadas como proteção contra adulteração deliberada do dispositivo.

## Verificações

| Verificação | Resultado |
| --- | --- |
| Baseline: lint e TypeScript | Aprovados |
| Baseline: regras + áudio | 22 testes aprovados |
| `npm run lint` | Aprovado |
| `npm run typecheck` | Aprovado |
| `npm test` | 29 testes aprovados |
| `npm run images:check` | 41 imagens com os mesmos pixels e dimensões |
| `npx expo-doctor` | 20/20 verificações aprovadas |
| `npx expo install --check` | Dependências alinhadas |
| Export de produção Android, iOS e web/servidor | Aprovado |
| `git diff --check` | Aprovado |
| `npm audit` | 8 alertas moderados remanescentes, descritos acima |

Os novos testes percorrem os seis programas e o treino, salvando e reabrindo após as respostas; verificam migração dos registros completos antigos, persistência de tentativas, resultados, pendências históricas, reconstrução da Nota Desafio e rejeição de dados corrompidos. Os testes anteriores continuam cobrindo pontuação 3/2/1/0, resgates, sorteio, conteúdo e efeitos sonoros.

A tentativa de validação visual com a skill computer-use e o navegador conectado encontrou falha da automação (`timeoutMs`) na navegação. Não houve inspeção visual concluída nem teste de interações em aparelho. O export para iOS não representa compilação, assinatura ou execução em iPhone. Não foi disparado build ou publicação no EAS. O Node emite um aviso não bloqueante ao executar os testes TypeScript como módulos em um projeto sem `type: module`; esse modo foi mantido para evitar alterar a configuração CommonJS do Expo/ESLint sem necessidade.

## Próximos passos recomendados

1. Gerar um novo development build, devido às alterações em módulos nativos, e validar retomada após fechar o processo, silêncio, foco/segundo plano, celebrações e compartilhamento do PDF em Android e iOS.
2. Medir início frio, frames lentos e memória em aparelho representativo, incluindo uma base com histórico longo. A redução dos arquivos não substitui essas medidas.
3. Avaliar codificação das faixas de áudio, que continuam sendo uma parcela grande dos recursos. Não houve recompressão com perda nem download obrigatório, preservando qualidade e funcionamento offline.
4. Acompanhar correções compatíveis de `minimatch` na cadeia de ferramentas. Evitar downgrade de SDK ou overrides de versão principal sem testes específicos.
5. Se o histórico real demonstrar custo de escrita relevante, considerar separar as chaves de sessão/histórico com migração testada. Não foi introduzida essa complexidade sem uma medição que a justifique.

Documentação consultada: [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/), [índice oficial](https://docs.expo.dev/llms.txt), [Audio](https://docs.expo.dev/versions/v58.0.0/sdk/audio/), [Video](https://docs.expo.dev/versions/v58.0.0/sdk/video/), [Router](https://docs.expo.dev/versions/v58.0.0/sdk/router/), [Image](https://docs.expo.dev/versions/v58.0.0/sdk/image/), [FlatList](https://reactnative.dev/docs/flatlist) e [AppState](https://reactnative.dev/docs/appstate).
