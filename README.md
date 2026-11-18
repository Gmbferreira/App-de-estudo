# App de estudo

Treino com bancos de questões de múltipla escolha. Roda inteiro no navegador, sem backend.

## Rodar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

## Adicionar um banco

1. Use o `PROMPT.md` com uma IA para converter as questões no formato do app.
2. Salve o JSON gerado em `src/banks/<id-do-banco>.json`.
3. Recarregue a página. O banco aparece na lista automaticamente.

Se o arquivo tiver algum problema (resposta que não existe, campo faltando etc.), o app mostra o erro no topo da lista e não carrega aquele banco. JSON malformado (vírgula sobrando, aspas abertas) aparece como erro na tela do Vite, indicando a linha.

**Ao editar um banco que já existe**, aumente o campo `version`. Isso descarta rodadas em andamento daquele banco, que poderiam não bater mais com as questões.

Imagens de questões ficam em `public/images/`, e a questão aponta para elas pelo campo `image` (ex.: `"image": "calculo/q012.png"`).

## Onde ficam os dados

A rodada em andamento e o histórico de tentativas ficam no `localStorage` do navegador. Isso significa que:

- cada navegador (e cada endereço: localhost ou Vercel) tem seus próprios dados;
- limpar os dados do navegador apaga o histórico.

## Publicar na Vercel

Importe o repositório na Vercel. Ela detecta o Vite sozinha (build: `npm run build`, saída: `dist`).

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor local com recarga automática |
| `npm run build` | Gera o site estático em `dist/` |
| `npm run preview` | Serve o `dist/` localmente para conferir o build |
| `npm run typecheck` | Verifica os tipos do TypeScript |

## Estrutura

```
src/
  banks/        bancos de questões (.json)
  lib/
    schema.ts   formato e validação dos bancos
    banks.ts    carrega e valida os bancos
    session.ts  lógica da rodada (fila, puladas, pontuação)
    storage.ts  rodada salva e histórico (localStorage)
    markdown.ts markdown + fórmulas (KaTeX)
  pages/        lista de bancos, questão, resultado
  components/
public/images/  imagens das questões
PROMPT.md       instruções para a IA gerar bancos
```
