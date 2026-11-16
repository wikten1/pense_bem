import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import { usePathname } from 'expo-router';
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openStore } from '@/storage/store';
import { colors, space } from '@/theme/tokens';

const menuSource = require('../../assets/audios/musica_aladin.mp3');
const quiz01Source = require('../../assets/audios/livro01.mp3');
const quiz02Source = require('../../assets/audios/livro02.mp3');
const quiz03Source = require('../../assets/audios/livro03.mp3');
const quiz04Source = require('../../assets/audios/livro04.mp3');
const quiz05Source = require('../../assets/audios/livro05.mp3');
const quiz06Source = require('../../assets/audios/musica 07.mp3');
const STORAGE_KEY = 'pense-bem:music-muted';
const subscribeToClient = () => () => {};

function subscribeToAppState(onChange: () => void) {
  const subscription = AppState.addEventListener('change', onChange);
  return () => subscription.remove();
}

function configurePlayer(player: AudioPlayer, muted: boolean) {
  player.loop = true;
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
  const source = introVisible || pathname === '/' || pathname === '/programs'
    ? menuSource
    : pathname === '/quiz/p1' ? quiz01Source
      : pathname === '/quiz/p2' ? quiz02Source
        : pathname === '/quiz/p3' ? quiz03Source
          : pathname === '/quiz/p4' ? quiz04Source
            : pathname === '/quiz/p5' ? quiz05Source
              : pathname === '/quiz/p6' ? quiz06Source : null;
  const playerRef = useRef<AudioPlayer | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const appState = useSyncExternalStore(subscribeToAppState, () => AppState.currentState, () => null);
  const storeRef = useRef<Awaited<ReturnType<typeof openStore>>['store'] | null>(null);
  const writesRef = useRef(Promise.resolve());
  const enabled = ready && appState === 'active';

  useEffect(() => {
    let active = true;

    async function restorePreference() {
      try {
        const { store } = await openStore();
        const saved = await store.getItem(STORAGE_KEY);
        if (active) {
          storeRef.current = store;
          setMuted(saved === 'true');
        }
      } catch (error) {
        console.warn('Não foi possível recuperar a preferência de música.', error);
      }
    }

    const audioMode = setAudioModeAsync({
      // On Android, false blocks media playback in both silent and vibrate modes.
      // The app's music button controls muting independently of the ringer.
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    }).catch((error) => {
      console.warn('Não foi possível configurar o áudio do app.', error);
    });

    Promise.all([restorePreference(), audioMode]).then(() => {
      if (active) setReady(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !storeRef.current) return;
    const store = storeRef.current;
    writesRef.current = writesRef.current
      .then(() => store.setItem(STORAGE_KEY, String(muted)))
      .catch((error) => {
        console.warn('Não foi possível salvar a preferência de música.', error);
      });
  }, [muted, ready]);

  return (
    <>
      {/* Release the previous decoder instead of loading every book at startup. */}
      {source !== null ? (
        <MusicTrack key={source} source={source} muted={muted} enabled={enabled} playerRef={playerRef} />
      ) : null}
      {source !== null ? (
        <Pressable
          accessibilityRole="switch"
          accessibilityLabel="Músicas do app"
          accessibilityHint={muted ? 'Ativar as músicas do app' : 'Silenciar as músicas do app'}
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
            setMuted((current) => !current);
          }}
          style={({ pressed }) => [
            styles.button,
            { top: insets.top + space.md, right: insets.right + space.lg },
            (pressed || !ready) && styles.dimmed,
          ]}>
          <Text style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">{muted ? '♪̸' : '♫'}</Text>
          <Text style={styles.label}>{muted ? 'Ativar som' : 'Silenciar'}</Text>
        </Pressable>
      ) : null}
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
