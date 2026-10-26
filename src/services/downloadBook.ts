import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';

export async function downloadBook(): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Este aparelho não oferece opções para salvar ou compartilhar o PDF.');
  }

  const book = Asset.fromModule(require('../../assets/documents/pense-bem-aladdin.pdf'));
  await book.downloadAsync();

  if (!book.localUri) {
    throw new Error('Não foi possível preparar o livro. Tente novamente.');
  }

  await Sharing.shareAsync(book.localUri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: 'Salvar ou compartilhar o livro de Aladdin',
  });
}
