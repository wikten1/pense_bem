type EffectPlayer = {
  seekTo: (seconds: number) => Promise<void>;
  play: () => void;
};

// Android seeks on the native main queue. Starting playback before it resolves
// can play the tail of a short effect, or leave an ended player silent.
export function replayButtonSound(
  player: EffectPlayer,
  waitForSeek: boolean,
  canPlay: () => boolean,
  onError: (error: unknown) => void,
) {
  try {
    const seek = player.seekTo(0);
    if (waitForSeek) {
      void seek.then(() => {
        if (canPlay()) player.play();
      }).catch(onError);
    } else {
      // Browsers require play() within the original user gesture.
      void seek.catch(onError);
      if (canPlay()) player.play();
    }
  } catch (error) {
    onError(error);
  }
}
