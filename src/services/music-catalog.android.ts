/* eslint-disable @typescript-eslint/no-require-imports -- Metro requires static asset paths. */
export const menuSource: number = require('../../assets/audios/optimized/musica_aladin.ogg');
export const programSources: Partial<Record<string, number>> = {
  p1: require('../../assets/audios/optimized/livro01.ogg'),
  p2: require('../../assets/audios/optimized/livro02.ogg'),
  p3: require('../../assets/audios/optimized/livro03.ogg'),
  p4: require('../../assets/audios/optimized/livro04.ogg'),
  p5: require('../../assets/audios/optimized/livro05.ogg'),
  p6: require('../../assets/audios/optimized/musica_07.ogg'),
  practice: require('../../assets/audios/optimized/musica_08.ogg'),
};
