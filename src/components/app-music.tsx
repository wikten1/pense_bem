import { useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppAudio } from '@/state/AudioProvider';
import { loadMusicAssets, menuSource, programSources } from '@/services/music-assets';
import { colors, space } from '@/theme/tokens';

const subscribeToClient = () => () => {};

type AppMusicProps = {
  introVisible: boolean;
  attempt: number;
  onReady: () => void;
  onError: () => void;
};

function configurePlayer(player: AudioPlayer, muted: boolean) {
  player.loop = true;
  player.volume = 0.5;
  player.muted = muted;
}

function MusicTrack({ source, muted, enabled, preparing, playerRef, onReady, onError }: {
  source: { uri: string };
  muted: boolean;
  enabled: boolean;
  preparing: boolean;
  playerRef: RefObject<AudioPlayer | null>;
  onReady: () => void;
  onError: () => void;
}) {
  const player = useAudioPlayer(source, { updateInterval: 1000 });
  const { error: playbackError, isLoaded } = useAudioPlayerStatus(player);
  const shouldPlay = enabled && !muted;

  useEffect(() => {
    if (playbackError) {
      console.warn('Não foi possível reproduzir a música do app.', playbackError);
      // Browser autoplay restrictions are playback errors, not download failures.
      if (preparing && !isLoaded) onError();
    }
  }, [isLoaded, onError, playbackError, preparing]);

  useEffect(() => {
    if (isLoaded) onReady();
  }, [isLoaded, onReady]);

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

export function AppMusic(props: AppMusicProps) {
  // Audio playback requires browser APIs that are unavailable during web SSR.
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  return isClient ? <MusicPlayer {...props} /> : null;
}

function MusicPlayer({ introVisible, attempt, onReady, onError }: AppMusicProps) {
  const [assets, setAssets] = useState<Awaited<ReturnType<typeof loadMusicAssets>> | null>(null);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const programId = /^\/(?:quiz|results)\/([^/]+)$/.exec(pathname)?.[1];
  const source = introVisible || pathname === '/' || pathname === '/programs' || pathname === '/history'
    ? menuSource
    : (programId ? programSources[programId] : undefined) ?? null;
  const playerRef = useRef<AudioPlayer | null>(null);
  const { muted, setMuted, ready, enabled, playSound, musicSuspended } = useAppAudio();

  useEffect(() => {
    let active = true;
    void loadMusicAssets().then((loaded) => {
      if (active) setAssets(loaded);
    }).catch((error) => {
      console.warn('Não foi possível carregar as músicas do app.', error);
      if (active) onError();
    });
    return () => { active = false; };
  }, [attempt, onError]);

  const audioSource = source === null ? undefined : assets?.get(source);

  return (
    <>
      {/* All files are cached; only the current track needs a decoder. */}
      {audioSource ? (
        <MusicTrack key={`${source}:${attempt}`} source={audioSource} muted={muted} enabled={enabled && !musicSuspended && !introVisible} preparing={introVisible} playerRef={playerRef} onReady={onReady} onError={onError} />
      ) : null}
      {!introVisible ? <Pressable
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
            if (muted && enabled && !musicSuspended) player.play();
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
      </Pressable> : null}
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
