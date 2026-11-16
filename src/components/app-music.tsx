import { useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppAudio } from '@/state/AudioProvider';
import { colors, space } from '@/theme/tokens';

const menuSource = require('../../assets/audios/musica_aladin.mp3');
const quiz01Source = require('../../assets/audios/livro01.mp3');
const quiz02Source = require('../../assets/audios/livro02.mp3');
const quiz03Source = require('../../assets/audios/livro03.mp3');
const quiz04Source = require('../../assets/audios/livro04.mp3');
const quiz05Source = require('../../assets/audios/livro05.mp3');
const quiz06Source = require('../../assets/audios/musica 07.mp3');
const practiceSource = require('../../assets/audios/musica 08.mp3');
const programSources: Partial<Record<string, number>> = {
  p1: quiz01Source,
  p2: quiz02Source,
  p3: quiz03Source,
  p4: quiz04Source,
  p5: quiz05Source,
  p6: quiz06Source,
  practice: practiceSource,
};
const subscribeToClient = () => () => {};

function configurePlayer(player: AudioPlayer, muted: boolean) {
  player.loop = true;
  player.volume = 0.5;
  player.muted = muted;
}

function MusicTrack({ source, muted, enabled, playerRef }: {
  source: number;
  muted: boolean;
  enabled: boolean;
  playerRef: RefObject<AudioPlayer | null>;
}) {
  // Cache Android assets locally to avoid streaming interruptions from Metro.
  const player = useAudioPlayer(source, { downloadFirst: Platform.OS === 'android', updateInterval: 1000 });
  const { error: playbackError, isLoaded } = useAudioPlayerStatus(player);
  const shouldPlay = enabled && !muted;

  useEffect(() => {
    if (playbackError) {
      console.warn('Não foi possível reproduzir a música do app.', playbackError);
    }
  }, [playbackError]);

  useEffect(() => {
    playerRef.current = player;
    return () => {
      playerRef.current = null;
      player.pause();
    };
  }, [player, playerRef]);

  useEffect(() => {
    configurePlayer(player, muted);
    if (shouldPlay && isLoaded) player.play();
    else player.pause();
  }, [isLoaded, muted, player, shouldPlay]);

  // Browsers may block autoplay until the first user interaction.
  useEffect(() => {
    if (Platform.OS !== 'web' || !shouldPlay) return;
    const resume = () => player.play();
    document.addEventListener('pointerdown', resume);
    document.addEventListener('keydown', resume);
    return () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, [player, shouldPlay]);

  return null;
}

export function AppMusic({ introVisible }: { introVisible: boolean }) {
  // Audio playback requires browser APIs that are unavailable during web SSR.
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  return isClient ? <MusicPlayer introVisible={introVisible} /> : null;
}

function MusicPlayer({ introVisible }: { introVisible: boolean }) {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const programId = /^\/(?:quiz|results)\/([^/]+)$/.exec(pathname)?.[1];
  const source = introVisible || pathname === '/' || pathname === '/programs'
    ? menuSource
    : (programId ? programSources[programId] : undefined) ?? null;
  const playerRef = useRef<AudioPlayer | null>(null);
  const { muted, setMuted, ready, enabled, playSound } = useAppAudio();

  return (
    <>
      {/* Release the previous decoder instead of loading every book at startup. */}
      {source !== null ? (
        <MusicTrack key={source} source={source} muted={muted} enabled={enabled} playerRef={playerRef} />
      ) : null}
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel="Música e efeitos sonoros"
        accessibilityHint={muted ? 'Ativar a música e os efeitos dos botões' : 'Silenciar a música e os efeitos dos botões'}
        accessibilityState={{ checked: !muted, disabled: !ready }}
        disabled={!ready}
        onPress={() => {
          // Start within the gesture so enabling music also works on the web.
          const player = playerRef.current;
          if (player) {
            configurePlayer(player, !muted);
            if (muted && enabled) player.play();
            else player.pause();
          }
          if (!muted) playSound('tap');
          setMuted(!muted);
        }}
        style={({ pressed }) => [
          styles.button,
          { top: insets.top + space.md, right: insets.right + space.lg },
          (pressed || !ready) && styles.dimmed,
        ]}>
        <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">{muted ? '♪̸' : '♫'}</Text>
        <Text style={styles.label}>{muted ? 'Ativar som' : 'Silenciar'}</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    zIndex: 2000,
    minWidth: 112,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.backgroundDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  icon: {
    color: colors.goldLight,
    fontSize: 22,
  },
  label: {
    color: colors.goldLight,
    fontSize: 13,
    fontWeight: '600',
  },
  dimmed: {
    opacity: 0.65,
  },
});
