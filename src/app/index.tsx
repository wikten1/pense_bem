import { router, useFocusEffect } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoldButton, NightScreen } from '@/components/game/ui';
import { findProgram } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

const source = require('../../assets/videos/background_intro.mp4');

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;
/** Bottom of the Aladdin logo drawn in background_intro.mp4. */
const LOGO_BOTTOM = 0.391;

function videoFrame(screenWidth: number, screenHeight: number) {
  const videoAspect = VIDEO_WIDTH / VIDEO_HEIGHT;
  if (screenWidth / screenHeight >= videoAspect) {
    const height = screenHeight;
    const width = height * videoAspect;
    return { top: 0, left: (screenWidth - width) / 2, width, height };
  }
  const width = screenWidth;
  const height = width / videoAspect;
  return { top: (screenHeight - height) / 2, left: 0, width, height };
}

type Viewport = { width: number; height: number };

function HomeBackground({ viewport }: { viewport: Viewport | null }) {
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
    video.play();
  });

  useFocusEffect(
    useCallback(() => {
      player.play();
      return () => {
        player.pause();
      };
    }, [player]),
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

function HomeLead({ viewport }: { viewport: Viewport }) {
  const insets = useSafeAreaInsets();
  const frame = videoFrame(viewport.width, viewport.height);
  const top = Math.max(insets.top + space.sm, frame.top + LOGO_BOTTOM * frame.height + space.md);

  return (
    <Text style={[styles.lead, { top }]} pointerEvents="none">
      Os Mistérios do Oriente
    </Text>
  );
}

export default function HomeScreen() {
  const { ready, persistent, session } = useGame();
  const current = session?.status === 'in_progress' ? findProgram(session.programId) : undefined;
  const [viewport, setViewport] = useState<Viewport | null>(null);

  const onLayout = useCallback((event: { nativeEvent: { layout: Viewport } }) => {
    const { width, height } = event.nativeEvent.layout;
    setViewport((currentViewport) =>
      currentViewport?.width === width && currentViewport.height === height ? currentViewport : { width, height },
    );
  }, []);

  return (
    <NightScreen backdrop={<HomeBackground viewport={viewport} />} overlay={viewport ? <HomeLead viewport={viewport} /> : null} onLayout={onLayout}>
      <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.actions}>
          {current && session ? (
            <GoldButton
              label={`Continuar ${current.title} · ${String(session.index + 1).padStart(2, '0')}/${String(session.quiz.length).padStart(2, '0')}`}
              onPress={() => router.push({ pathname: '/quiz/[programId]', params: { programId: session.programId } })}
            />
          ) : null}
          <GoldButton label="Escolher programa" onPress={() => router.push('/programs')} variant={current ? 'secondary' : 'primary'} />
          <GoldButton label="Resultados e Nota Desafio" onPress={() => router.push('/history')} variant="secondary" />
        </View>

        {ready && !persistent ? (
          <Text style={styles.note}>
            Este build ainda não grava a partida ao fechar o aplicativo. Recompile o app de desenvolvimento para ativar o armazenamento local.
          </Text>
        ) : null}
      </ScrollView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
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
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: space.md,
  },
  lead: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    zIndex: 1,
    color: colors.goldLight,
    fontFamily: fonts.cinzel,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(14, 20, 50, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  actions: {
    gap: space.sm,
  },
  note: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
});
