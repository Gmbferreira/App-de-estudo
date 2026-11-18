import type { ZodIssue } from 'zod';
import { bankFiles } from './bankFiles';
import { bankSchema, errorMap, type Bank } from './schema';

export interface BankFileError {
  file: string;
  messages: string[];
}

function formatIssue(issue: ZodIssue, raw: unknown): string {
  const path = [...issue.path];
  let prefix = '';

  if (path[0] === 'questions' && typeof path[1] === 'number') {
    const index = path[1];
    const questions = (raw as { questions?: { id?: unknown }[] })?.questions;
    const id = questions?.[index]?.id;
    prefix = typeof id === 'string' && id ? `questão ${id}` : `questão nº ${index + 1}`;
    path.splice(0, 2);
  }

  const rest = path
    .map((p, i) => (typeof p === 'number' ? `[${p}]` : i === 0 ? p : `.${p}`))
    .join('');
  const where = [prefix, rest].filter(Boolean).join(', campo ');
  return where ? `${where}: ${issue.message}` : issue.message;
}

export function parseBanks(files: Record<string, unknown>) {
  const banks: Bank[] = [];
  const errors: BankFileError[] = [];
  const ids = new Map<string, string>();

  for (const [path, raw] of Object.entries(files)) {
    const file = path.split('/').pop() ?? path;
    const result = bankSchema.safeParse(raw, { errorMap });

    if (!result.success) {
      errors.push({ file, messages: result.error.issues.map((i) => formatIssue(i, raw)) });
      continue;
    }

    const other = ids.get(result.data.id);
    if (other) {
      errors.push({
        file,
        messages: [`o id "${result.data.id}" já é usado por ${other}`],
      });
      continue;
    }

    ids.set(result.data.id, file);
    banks.push(result.data);
  }

  banks.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
  errors.sort((a, b) => a.file.localeCompare(b.file));
  return { banks, errors };
}

export const { banks, errors: bankErrors } = parseBanks(bankFiles);
