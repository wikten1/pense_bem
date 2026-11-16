import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from 'react';
import { AppState, Platform } from 'react-native';

import { replayButtonSound } from '@/services/replayButtonSound';
import { useAppActive } from '@/hooks/use-app-active';
import { openStore } from '@/storage/store';

export type ButtonSound = 'tap' | 'back' | 'red' | 'yellow' | 'blue' | 'green';
type PlayerMap = Record<ButtonSound, AudioPlayer>;

const STORAGE_KEY = 'pense-bem:music-muted'; // Preserve the existing sound preference.
const subscribeToClient = () => () => {};
const playerOptions = { downloadFirst: true, updateInterval: 1000 };
const AudioContext = createContext({
  muted: false,
  ready: false,
  enabled: false,
  musicSuspended: false,
  setMusicSuspended: (_suspended: boolean) => {},
  setMuted: (_muted: boolean) => {},
  playSound: (_sound: ButtonSound) => {},
});

function SoundPlayers({ playersRef, enabled }: { playersRef: RefObject<PlayerMap | null>; enabled: boolean }) {
  // One shared, preloaded player per sound; never allocate a decoder per button.
  const tap = useAudioPlayer(require('../../assets/audios/effects/tap.wav'), playerOptions);
  const back = useAudioPlayer(require('../../assets/audios/effects/back.wav'), playerOptions);
  const red = useAudioPlayer(require('../../assets/audios/effects/red.wav'), playerOptions);
  const yellow = useAudioPlayer(require('../../assets/audios/effects/yellow.wav'), playerOptions);
  const blue = useAudioPlayer(require('../../assets/audios/effects/blue.wav'), playerOptions);
  const green = useAudioPlayer(require('../../assets/audios/effects/green.wav'), playerOptions);
  const players = useMemo(() => ({ tap, back, red, yellow, blue, green }), [tap, back, red, yellow, blue, green]);

  useEffect(() => {
    playersRef.current = players;
    return () => { playersRef.current = null; };
  }, [players, playersRef]);

  useEffect(() => {
    for (const player of Object.values(players)) {
      // Use volume alone: native mute/volume setters may run on different queues.
      player.volume = enabled ? 0.9 : 0;
      if (!enabled) player.pause();
    }
  }, [enabled, players]);

  useEffect(() => {
    const subscriptions = Object.entries(players).map(([sound, player]) =>
      player.addListener('playbackStatusUpdate', (status) => {
        if (status.error) console.warn(`Falha ao carregar o efeito ${sound}.`, status.error);
      }));
    return () => subscriptions.forEach((subscription) => subscription.remove());
  }, [players]);

  return null;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(subscribeToClient, () => true, () => false);
  const appActive = useAppActive();
  const [muted, setMuted] = useState(false);
  const [musicSuspended, setMusicSuspended] = useState(false);
  const [ready, setReady] = useState(false);
  const playersRef = useRef<PlayerMap | null>(null);
  const storeRef = useRef<Awaited<ReturnType<typeof openStore>>['store'] | null>(null);
  const writesRef = useRef(Promise.resolve());
  const playbackRequest = useRef(0);
  const enabled = ready && appActive;

  useEffect(() => {
    // Cancel native seeks pending across mute, background, or unmount.
    return () => { playbackRequest.current += 1; };
  }, [enabled, muted]);

  useEffect(() => {
    let active = true;
    async function prepareAudio() {
      const preference = (async () => {
        try {
          const { store } = await openStore();
          const saved = await store.getItem(STORAGE_KEY);
          if (active) {
            storeRef.current = store;
            setMuted(saved === 'true');
          }
        } catch (error) {
          console.warn('Não foi possível recuperar a preferência de som.', error);
        }
      })();
      const mode = setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'mixWithOthers',
      }).catch((error) => console.warn('Não foi possível configurar o áudio do app.', error));
      await Promise.all([preference, mode]);
      if (active) setReady(true);
    }
    void prepareAudio();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready || !storeRef.current) return;
    const store = storeRef.current;
    writesRef.current = writesRef.current
      .then(() => store.setItem(STORAGE_KEY, String(muted)))
      .catch((error) => console.warn('Não foi possível salvar a preferência de som.', error));
  }, [muted, ready]);

  function playSound(sound: ButtonSound) {
    if (!enabled || muted || AppState.currentState !== 'active') return;
    const players = playersRef.current;
    const player = players?.[sound];
    // Android's isLoaded getter becomes false at STATE_ENDED. It must not
    // gate replay; play() also handles a source that is still buffering.
    if (!players || !player) return;
    const request = ++playbackRequest.current;
    try {
      // Keep rapid taps from stacking, and restart even after a sound has ended.
      for (const other of Object.values(players)) {
        if (other !== player && other.playing) other.pause();
      }
      replayButtonSound(
        player,
        Platform.OS !== 'web',
        () => request === playbackRequest.current && AppState.currentState === 'active',
        (error) => console.warn('Não foi possível reproduzir o efeito sonoro.', error),
      );
    } catch (error) {
      // Audio failures must never prevent a button's action.
      console.warn('Não foi possível reproduzir o efeito sonoro.', error);
    }
  }

  return (
    <AudioContext.Provider value={{ muted, ready, enabled, setMuted, playSound, musicSuspended, setMusicSuspended }}>
      {isClient ? <SoundPlayers playersRef={playersRef} enabled={enabled && !muted} /> : null}
      {children}
    </AudioContext.Provider>
  );
}

export function useAppAudio() {
  return useContext(AudioContext);
}
