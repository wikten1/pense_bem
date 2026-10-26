import { Asset } from 'expo-asset';

export async function downloadBook(): Promise<void> {
  const book = Asset.fromModule(require('../../assets/documents/pense-bem-aladdin.pdf'));
  const response = await fetch(book.uri);
  if (!response.ok) {
    throw new Error('Não foi possível baixar o livro. Tente novamente.');
  }

  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pense-bem-aladdin.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser time to start reading the file before releasing it.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
