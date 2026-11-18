// Todos os arquivos .json em src/banks entram no app automaticamente.
export const bankFiles: Record<string, unknown> = import.meta.glob('../banks/*.json', {
  eager: true,
  import: 'default',
});
