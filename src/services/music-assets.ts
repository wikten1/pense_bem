import { Asset } from 'expo-asset';
import { Platform } from 'react-native';

import { menuSource, programSources } from './music-catalog';

export { menuSource, programSources } from './music-catalog';

const sources = [menuSource, ...Object.values(programSources)] as number[];
// Keep compressed files cached for the app session, without opening every decoder.
const downloads = new Map<number, Promise<{ uri: string }>>();

function downloadMusic(source: number) {
  const cached = downloads.get(source);
  if (cached) return cached;

  const download = (async () => {
    const asset = Asset.fromModule(source);
    if (Platform.OS === 'web') {
      // Asset.downloadAsync is a no-op on web; await the entire response instead.
      const response = await fetch(asset.uri);
      if (!response.ok) throw new Error(`Falha ao carregar música (${response.status}).`);
      return { uri: URL.createObjectURL(await response.blob()) };
    }
    await asset.downloadAsync();
    return { uri: asset.localUri ?? asset.uri };
  })().catch((error) => {
    downloads.delete(source);
    throw error;
  });
  downloads.set(source, download);
  return download;
}

export async function loadMusicAssets() {
  const assets = await Promise.all(sources.map(downloadMusic));
  return new Map(sources.map((source, index) => [source, assets[index]]));
}
