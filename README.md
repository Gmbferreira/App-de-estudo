# App de estudo

> **Aviso de transparência: software feito com IA**
>
> Este projeto foi construído com inteligência artificial (Claude, da Anthropic). Todo o código, os textos da interface, este README, o prompt de geração de bancos (`PROMPT.md`) e os bancos de questões incluídos foram escritos pela IA.
>
> A participação humana se limitou ao **planejamento e à tomada de decisões**: definir o que o app deve fazer, escolher entre as opções propostas pela IA e aprovar ou pedir mudanças. Nenhuma linha de código foi escrita à mão.
>
> Os bancos de questões também são gerados por IA a partir de questões reais. Eles podem conter erros, principalmente nas alternativas erradas criadas pela IA e nos gabaritos que a IA precisou resolver sozinha (o app avisa quando é o caso). Na dúvida, confira em outra fonte.

Treino com bancos de questões de múltipla escolha. Roda inteiro no navegador, sem backend.

- Questões e alternativas aparecem em ordem aleatória a cada rodada.
- O acerto é mostrado logo após cada resposta.
- Questões puladas voltam no final; pular de novo conta como erro.
- No fim, a % de acerto, a lista das erradas com a resposta certa e a opção de refazer só as erradas.
- A rodada em andamento e o histórico ficam salvos no navegador.
- Modo claro e escuro.

## Rodar

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

## Criar a sua versão, com os seus bancos

1. **Faça um fork** deste repositório no GitHub (botão *Fork* em https://github.com/Gmbferreira/App-de-estudo) e clone o seu fork:

   ```bash
   git clone https://github.com/SEU-USUARIO/App-de-estudo.git
   cd App-de-estudo
   npm install
   ```

2. **Tire os bancos que vieram com o projeto.** Apague os arquivos `.json` de `src/banks/`. Se quiser um modelo para consultar, mantenha o `exemplo.json` até ter os seus.

3. **Gere os seus bancos com IA.** Abra o `PROMPT.md`, copie o texto abaixo da linha, preencha os dados do banco (id, título etc.) e cole no final as questões e, se tiver, o gabarito. Envie para a IA de sua preferência.
   - As questões não precisam ser de múltipla escolha: a IA cria as alternativas que faltarem.
   - Sem gabarito, a IA resolve as questões, e o app avisa que aquele gabarito foi gerado por IA.
   - Questões que não dão para virar múltipla escolha ficam de fora, listadas pela IA depois do JSON.

4. **Salve o JSON** gerado em `src/banks/<id-do-banco>.json`. O nome do arquivo não importa para o app, mas usar o id facilita.

5. **Rode `npm run dev`** e confira. O banco aparece na lista automaticamente. Se o arquivo tiver algum problema, o app mostra o erro no topo da lista (veja [Adicionar ou editar um banco](#adicionar-ou-editar-um-banco)).

6. **Publique, se quiser** (veja [Publicar na Vercel](#publicar-na-vercel)).

## Adicionar ou editar um banco

- Cada arquivo `.json` em `src/banks/` é um banco. Todos entram no app sozinhos, sem registrar em lugar nenhum.
- Se o arquivo tiver algum problema (resposta que não existe, campo faltando, id repetido etc.), o app mostra o erro no topo da lista e não carrega aquele banco. JSON malformado (vírgula sobrando, aspas abertas) aparece como erro na tela do Vite, indicando a linha.
- Cada banco precisa de um `id` único. O histórico e a rodada salva ficam ligados a esse id, então mudar o id equivale a começar um banco novo. O título pode ser trocado à vontade.
- **Ao editar as questões de um banco que já existe**, aumente o campo `version`. Isso descarta rodadas em andamento daquele banco, que poderiam não bater mais com as questões.
- Imagens de questões ficam em `public/images/`, e a questão aponta para elas pelo campo `image` (ex.: `"image": "calculo/q012.png"`).
- O formato completo de um banco está descrito no `PROMPT.md`.

## Onde ficam os dados

A rodada em andamento, o histórico de tentativas e a escolha de tema ficam no `localStorage` do navegador. Isso significa que:

- cada navegador (e cada endereço: localhost ou Vercel) tem seus próprios dados;
- limpar os dados do navegador apaga o histórico.

## Publicar na Vercel

Importe o repositório (ou o seu fork) na Vercel. Ela detecta o Vite sozinha (build: `npm run build`, saída: `dist`). A cada push, o site é atualizado.

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
    theme.ts    modo claro e escuro
  pages/        lista de bancos, questão, resultado
  components/
public/images/  imagens das questões
PROMPT.md       instruções para a IA gerar bancos
```
