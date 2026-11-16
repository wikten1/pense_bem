# Pense Bem — Aladdin

Aplicativo Expo/React Native para jogar as 150 perguntas de **Aladdin em Os Mistérios do Oriente**, com cinco programas sequenciais, revisão com sorteio, treino, retomada de partida, resultados e Nota Desafio. Inclui ilustrações ampliáveis, músicas, efeitos, vídeos e o livro em PDF. O conteúdo funciona localmente, sem backend.

## Desenvolvimento

O projeto utiliza npm e Expo SDK 58. Instale a versão de Node compatível com o SDK e use o lockfile:

```sh
npm ci
npm start
```

Para abrir uma plataforma, use `npm run android`, `npm run ios` ou `npm run web`. Ao adicionar um pacote, utilize `npx expo install <pacote>` para resolver versões compatíveis. No PowerShell com scripts bloqueados, use `npm.cmd` e `npx.cmd`.

As mudanças em módulos nativos exigem um novo development build. Para o perfil já configurado no EAS:

```sh
npx eas-cli@latest build --profile development --platform android
```

Troque a plataforma por `ios` quando necessário. As pastas nativas geradas não são a fonte da configuração: mantenha-a em `app.json` e plugins.

## Publicação web na Vercel

Endereço público da demonstração: https://pense-bem-aladdin.vercel.app

A versão web é uma aplicação estática, sem backend. `npm run build:web` exporta o site para `dist`; `vercel.json` configura o build e o redirecionamento das rotas do Expo Router, inclusive `/quiz/p1` e `/results/p1`, para a aplicação. O progresso fica no navegador de cada visitante e não é sincronizado entre dispositivos.

Para testar a exportação localmente:

```sh
npm run build:web
npx expo serve
```

O projeto `pense-bem` está configurado no workspace `wiktenalves-4190s-projects`. Para atualizar a demonstração, execute lint, typecheck e testes, salve as alterações em um commit e envie ao GitHub. Depois, autenticado na conta Vercel correta:

```sh
npx vercel@latest login
npm run deploy:web
```

O script envia apenas a configuração de build. A Vercel baixa o commit atual do repositório público e executa `npm ci` e `npm run build:web`, sem precisar da integração GitHub. O script mostra o ID do deploy; acompanhe até o estado **Ready** pelo painel ou com `npx vercel@latest inspect <id>`. `npm run deploy:web -- --dry-run` mostra o commit e o destino sem publicar. O repositório precisa continuar público para esse método funcionar. Cada atualização exige executar o script; commits isolados não iniciam deploys automáticos.

Para ativar deploys automáticos no futuro, conecte o repositório nas configurações Git do projeto na Vercel. Mantenha o framework como **Other**, o comando de build como `npm run build:web` e a pasta de saída como `dist`.

O workspace utiliza o plano Hobby gratuito, com limites de uso e destinado a projetos pessoais e não comerciais. O build na nuvem evita enviar pelo CLI todos os arquivos de áudio, vídeo e imagens, que excedem o limite de 100 MB de envio de fontes no plano Hobby.

Antes de compartilhar o link, teste a abertura e atualização das rotas, uma partida com salvamento e retomada, áudio após interação com a página e download do livro. Navegadores podem bloquear reprodução de áudio antes da primeira interação.

## Organização

| Pasta | Responsabilidade |
| --- | --- |
| `src/app` | Telas e layout do Expo Router |
| `src/components/game` | Interface do jogo, ilustrações, fundo e itens do histórico |
| `src/components` | Players e interações compartilhadas |
| `src/content` | Perguntas da revista e metadados das ilustrações |
| `src/game` | Pontuação, tentativas, sorteio, senhas e restauração de sessão |
| `src/state` | Integração do progresso e das preferências de áudio com React |
| `src/storage` | Adaptador de armazenamento e formato validado dos salvamentos |
| `src/services` | Efeitos e download do PDF, com implementação específica para web |
| `src/hooks` | Estado compartilhado de primeiro plano do aplicativo |
| `src/theme` | Cores, fontes e espaçamentos |
| `assets` | Recursos locais usados pelo aplicativo e originais de imagem |
| `artwork`, `scripts`, `docs` | Matrizes, ferramentas de arte e documentação |

O progresso usa a chave `pense-bem-aladdin-v1`; o leitor aceita o formato completo anterior e o formato compacto atual. Conteúdo e pontos derivados são reconstruídos com as regras do catálogo. Registros inválidos não são sobrescritos automaticamente. A preferência de silêncio continua na chave `pense-bem:music-muted`.

## Verificação

```sh
npm run lint
npm run typecheck
npm test
npm run images:check
npx expo-doctor
npx expo install --check
```

`npm test` executa as regras, a persistência e os efeitos sonoros; `npm run test:audio` executa somente os efeitos. `images:check` compara dimensões e pixels de todos os derivados sem perdas usados pelas telas.

## Recursos e métricas

Após modificar um PNG utilizado pelas telas, execute `npm run images:optimize`. O script cria apenas derivados menores com pixels idênticos e nomes `*.lossless.webp`, atualiza as referências e registra os tamanhos em `docs/runtime-images.json`. Os originais e os WebPs do processo editorial são preservados. As ferramentas editoriais anteriores continuam disponíveis em `npm run images:aladdin` e `npm run images:aladdin:scan`.

Para gerar um export de produção e comparar com a referência local capturada antes da otimização:

```sh
npx expo export --platform all --output-dir tmp/optimization-final --dump-assetmap
node --experimental-strip-types scripts/measure-optimization.mjs
```

A medição exige `tmp/optimization-before`, criado na análise inicial; essa pasta temporária não é versionada. Os resultados registrados estão em [docs/optimization-metrics.json](docs/optimization-metrics.json), e o script aceita caminhos alternativos como primeiro e segundo argumentos.

Leia o [relatório de análise e otimização](docs/relatorio-otimizacao.md) para alterações, evidências, alertas de segurança remanescentes e validações que ainda exigem aparelho. As regras editoriais estão em [docs/perguntas-e-respostas.md](docs/perguntas-e-respostas.md).
