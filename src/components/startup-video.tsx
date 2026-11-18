import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { useAppActive } from '@/hooks/use-app-active';

const INTRO_MS = 2000;
const FALLBACK_MS = 1200;

const source = require('../../assets/videos/Mobile_app_loading_720.mp4');

type StartupVideoProps = {
  onReady: () => void;
  onFinish: () => void;
  loadError: boolean;
  onRetry: () => void;
};

export function StartupVideo({ onReady, onFinish, loadError, onRetry }: StartupVideoProps) {
  const appActive = useAppActive();
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
  });

  useEffect(() => {
    if (appActive) player.play();
    else player.pause();
  }, [appActive, player]);

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
        surfaceType="textureView"
        nativeControls={false}
        allowsPictureInPicture={false}
        playsInline
        onFirstFrameRender={begin}
      />
      <View style={styles.status}>
        {loadError ? (
          <>
            <Text accessibilityRole="alert" style={styles.message}>Não foi possível carregar as músicas.</Text>
            <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
              <Text style={styles.message}>Tentar novamente</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.goldLight} />
            <Text accessibilityLiveRegion="polite" style={styles.message}>Carregando músicas…</Text>
          </>
        )}
      </View>
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
  status: {
    position: 'absolute',
    bottom: '10%',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.backgroundDeep,
  },
  message: {
    color: colors.goldLight,
    textAlign: 'center',
  },
  retry: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 24,
  },
});
