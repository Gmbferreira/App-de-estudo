import { z } from 'zod';

const optionSchema = z.object({
  id: z.string().min(1, 'id da alternativa vazio'),
  text: z.string().min(1, 'texto da alternativa vazio'),
});

const questionSchema = z
  .object({
    id: z.string().min(1, 'id da questão vazio'),
    statement: z.string().min(1, 'enunciado vazio'),
    options: z.array(optionSchema).min(2, 'a questão precisa de pelo menos 2 alternativas'),
    answer: z.string().min(1, 'resposta vazia'),
    answerSource: z.enum(['official', 'ai']),
    optionsSource: z.enum(['original', 'generated']),
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
  })
  .superRefine((q, ctx) => {
    const ids = q.options.map((o) => o.id);
    const duplicated = ids.find((id, i) => ids.indexOf(id) !== i);
    if (duplicated) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `id de alternativa repetido: "${duplicated}"`,
      });
    }
    if (!ids.includes(q.answer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answer'],
        message: `"${q.answer}" não é o id de nenhuma alternativa (${ids.join(', ')})`,
      });
    }
  });

export const bankSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'use só letras minúsculas, números e hífens'),
    title: z.string().min(1, 'título vazio'),
    description: z.string().optional(),
    source: z.string().optional(),
    version: z.number().int().positive(),
    tags: z.array(z.string()).optional(),
    questions: z.array(questionSchema).min(1, 'o banco não tem questões'),
  })
  .superRefine((b, ctx) => {
    const seen = new Set<string>();
    b.questions.forEach((q, i) => {
      if (seen.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['questions', i, 'id'],
          message: `id de questão repetido: "${q.id}"`,
        });
      }
      seen.add(q.id);
    });
  });

export type Bank = z.infer<typeof bankSchema>;
export type Question = Bank['questions'][number];
export type Option = Question['options'][number];

/** Mensagens de erro em português para os casos mais comuns. */
export const errorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === 'undefined') return { message: 'campo obrigatório ausente' };
    return { message: `tipo inválido: esperado ${issue.expected}, recebido ${issue.received}` };
  }
  if (issue.code === z.ZodIssueCode.invalid_enum_value) {
    return {
      message: `valor inválido "${String(issue.received)}"; use ${issue.options
        .map((o) => `"${String(o)}"`)
        .join(' ou ')}`,
    };
  }
  return { message: ctx.defaultError };
};
