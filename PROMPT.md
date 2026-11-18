# Prompt para gerar bancos de questões

Copie tudo abaixo da linha, preencha os campos entre `<< >>` e cole as questões no final.

---

Você vai converter questões de prova em um **banco de questões de múltipla escolha** no formato JSON descrito abaixo. As questões podem ou não ser de múltipla escolha, e o gabarito pode ou não ter sido fornecido.

## Dados do banco

- **id:** <<ex.: calculo1-p1-2024>> (minúsculas, números e hífens)
- **title:** <<ex.: Cálculo I – P1 2024>>
- **description:** <<opcional>>
- **source:** <<opcional, ex.: UFXX – Prof. Fulano>>
- **tags:** <<opcional, ex.: cálculo, limites>>

## Como tratar cada questão

| Questão original | Gabarito fornecido | O que fazer |
|---|---|---|
| Múltipla escolha | Sim | Manter enunciado, alternativas e gabarito originais. |
| Múltipla escolha | Não | Manter enunciado e alternativas originais. Resolver a questão para definir a correta. |
| Aberta | Sim | Ajustar o enunciado minimamente, criar a alternativa correta a partir do gabarito e gerar as erradas. |
| Aberta | Não | Ajustar o enunciado minimamente, resolver a questão, criar a correta e gerar as erradas. |

### Regras de fidelidade

1. **Nunca altere** o enunciado de uma questão de múltipla escolha, o sentido de suas alternativas originais ou um gabarito oficial. As únicas mudanças permitidas nas alternativas originais estão em "Alternativas são sempre embaralhadas".
2. Em questões abertas, altere o enunciado **apenas o necessário** para que faça sentido com alternativas (ex.: "Explique por que..." → "Qual alternativa explica corretamente por que...?"). Preserve todos os dados, valores e o contexto.
3. Quando a correta vier de um gabarito oficial, ela deve ser **fiel ao sentido** da resposta oficial, apenas resumida.
4. Questões de múltipla escolha mantêm a **quantidade original** de alternativas. Questões abertas recebem **exatamente 5 alternativas**, com ids `a`, `b`, `c`, `d`, `e`.

### Regras para alternativas geradas

- Todas devem ser **plausíveis**: baseadas em erros comuns, confusões conceituais, contas com um passo errado, conceitos vizinhos ou afirmações parcialmente verdadeiras.
- Tamanho, estilo, nível de detalhe e estrutura gramatical **semelhantes** entre si e à correta.
- A correta **não** pode ser sistematicamente a mais longa, a mais detalhada ou a mais "cuidadosa".
- Nada de alternativas absurdas, engraçadas ou obviamente erradas.
- **Não** gere "Todas as anteriores", "Nenhuma das anteriores" ou alternativas que citem outras.
- Apenas **uma** alternativa pode ser correta. Confira se nenhuma errada também está correta.

### Alternativas são sempre embaralhadas

O app **sempre** embaralha as alternativas e exibe A, B, C... conforme a nova posição. Os `id`s são internos e nunca aparecem para o usuário. Portanto, nenhuma alternativa pode depender de letra, número ou posição:

- **Remova prefixos de enumeração** do texto (`a)`, `(B)`, `C -`, `1.`, `I)` etc.). O texto deve conter só o conteúdo.
- **Reescreva alternativas que citam outras por posição** para que façam sentido em qualquer ordem, mantendo o significado:
  - "Todas as anteriores" → "Todas as demais alternativas estão corretas"
  - "Nenhuma das anteriores" → "Nenhuma das demais alternativas está correta"
  - "A e C estão corretas" → reescreva citando o conteúdo de A e C, ou converta a questão para o formato de afirmações numeradas no enunciado (ver abaixo).
- **Afirmações numeradas no enunciado** (I, II, III...) são permitidas, porque ficam no enunciado e não se movem. Alternativas como "Apenas I e III" são seguras.
- O gabarito fornecido pode usar letras ou números da prova original: use-os apenas para identificar qual alternativa é a correta e registre o `id` correspondente em `answer`.

### Quando NÃO incluir uma questão

Deixe a questão de fora (e liste-a no final, como descrito em "Saída") quando:

- não puder virar múltipla escolha sem perder o sentido (redação, demonstração longa, opinião, desenho);
- depender de uma imagem, gráfico ou tabela que não foi fornecido e não puder ser descrito em texto;
- não houver gabarito e você **não tiver segurança** na resposta.

## Formato do JSON

```json
{
  "id": "string",
  "title": "string",
  "description": "string (opcional)",
  "source": "string (opcional)",
  "version": 1,
  "tags": ["string"],
  "questions": [
    {
      "id": "q001",
      "statement": "string em markdown",
      "options": [
        { "id": "a", "text": "string em markdown" },
        { "id": "b", "text": "..." },
        { "id": "c", "text": "..." },
        { "id": "d", "text": "..." },
        { "id": "e", "text": "..." }
      ],
      "answer": "c",
      "answerSource": "official",
      "optionsSource": "generated",
      "source": "string (opcional, ex.: Questão 7)",
      "tags": ["string"],
      "image": "string (opcional)"
    }
  ]
}
```

### Campos

| Campo | Obrigatório | Valores |
|---|---|---|
| `id` (questão) | sim | `q001`, `q002`, ... sequencial e único |
| `statement` | sim | Markdown. Fórmulas em LaTeX: `$x^2$` ou `$$\int f(x)\,dx$$` |
| `options[].id` | sim | identificador interno único na questão: `a`, `b`, `c`... em sequência. Não precisa corresponder à letra da prova original |
| `options[].text` | sim | Markdown, sem prefixo de enumeração |
| `answer` | sim | id de uma das `options` |
| `answerSource` | sim | `"official"` se veio do gabarito fornecido, `"ai"` se você resolveu |
| `optionsSource` | sim | `"original"` se a questão já era de múltipla escolha, `"generated"` se você criou as alternativas |
| `source`, `tags`, `image` | não | omita se não houver |

- Omita campos opcionais vazios (não use `null` nem `""`).
- **Não** inclua explicações nem comentários dentro do JSON.

## Saída

1. Um único bloco de código ```json com o banco completo e válido.
2. Depois do bloco, uma seção **"Questões não incluídas"** listando o número/identificação de cada questão deixada de fora e o motivo em uma linha. Se nenhuma foi excluída, escreva "Nenhuma".

## Questões

<<cole aqui as questões>>

## Gabarito (opcional)

<<cole aqui o gabarito, se tiver; caso contrário, apague esta seção>>
