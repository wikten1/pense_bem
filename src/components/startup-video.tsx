import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { colors } from '@/theme/tokens';

const INTRO_MS = 2000;
const FALLBACK_MS = 1200;

const source = require('../../assets/videos/Mobile_app_loading_720.mp4');

type StartupVideoProps = {
  onReady: () => void;
  onFinish: () => void;
};

export function StartupVideo({ onReady, onFinish }: StartupVideoProps) {
  const started = useRef(false);
  const finishTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const player = useVideoPlayer(source, (video) => {
    video.muted = true;
    video.volume = 0;
    video.loop = true;
    if (Platform.OS !== 'web') {
      video.audioMixingMode = 'mixWithOthers';
      video.showNowPlayingNotification = false;
    }
    video.play();
  });

  const begin = useCallback(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    onReady();
    finishTimer.current = setTimeout(onFinish, INTRO_MS);
  }, [onFinish, onReady]);

  useEffect(() => {
    const fallback = setTimeout(begin, FALLBACK_MS);
    return () => {
      clearTimeout(fallback);
      if (finishTimer.current) {
        clearTimeout(finishTimer.current);
      }
    };
  }, [begin]);

  return (
    <View style={styles.overlay}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
        allowsPictureInPicture={false}
        playsInline
        onFirstFrameRender={begin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    zIndex: 1000,
  },
  video: {
    flex: 1,
  },
});
