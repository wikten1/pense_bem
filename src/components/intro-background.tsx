import { useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useAppActive } from '@/hooks/use-app-active';

const source = require('../../assets/videos/background_intro.mp4');

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;
/** Bottom of the Aladdin logo drawn in background_intro.mp4. */
export const LOGO_BOTTOM = 0.392;
/** The logo flourish starts about 4.4% in from the frame edge. */
const LOGO_SIDE_MARGIN = 0.03;

export type Viewport = { width: number; height: number };

export function videoFrame(screenWidth: number, screenHeight: number) {
  const videoAspect = VIDEO_WIDTH / VIDEO_HEIGHT;
  const widthFit = screenWidth;
  const heightFit = screenWidth / videoAspect;
  const coverWidth = screenHeight * videoAspect;
  const coverHeight = screenHeight;
  const safeWidth = screenWidth / (1 - LOGO_SIDE_MARGIN * 2);
  const safeHeight = safeWidth / videoAspect;
  const width = Math.min((widthFit + coverWidth) / 2, safeWidth);
  const height = Math.min((heightFit + coverHeight) / 2, safeHeight);
  const spare = Math.max(0, screenHeight - height);

  return {
    top: spare,
    left: (screenWidth - width) / 2,
    width,
    height,
  };
}

export function IntroBackground({ viewport }: { viewport: Viewport | null }) {
  const appActive = useAppActive();
  const frame = viewport ? videoFrame(viewport.width, viewport.height) : null;
  const player = useVideoPlayer(source, (video) => {
    video.muted = true;
    video.volume = 0;
    video.loop = true;
    video.keepScreenOnWhilePlaying = false;
    if (Platform.OS !== 'web') {
      video.audioMixingMode = 'mixWithOthers';
      video.showNowPlayingNotification = false;
    }
  });

  useFocusEffect(
    useCallback(() => {
      if (appActive) player.play();
      else player.pause();
      return () => {
        player.pause();
      };
    }, [appActive, player]),
  );

  return (
    <>
      <View pointerEvents="none" style={styles.sky} />
      <VideoView
        player={player}
        style={frame ? [styles.video, frame] : styles.videoHidden}
        contentFit="contain"
        surfaceType="textureView"
        nativeControls={false}
        allowsPictureInPicture={false}
        allowsVideoFrameAnalysis={false}
        playsInline
        pointerEvents="none"
      />
    </>
  );
}

export function useScreenViewport() {
  const [viewport, setViewport] = useState<Viewport | null>(null);
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport((current) => (current?.width === width && current.height === height ? current : { width, height }));
  }, []);
  return { viewport, onLayout };
}

const styles = StyleSheet.create({
  sky: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0B1A41',
  },
  video: {
    position: 'absolute',
  },
  videoHidden: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
});
