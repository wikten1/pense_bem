import { Cinzel_400Regular } from '@expo-google-fonts/cinzel/400Regular';
import { Cinzel_600SemiBold } from '@expo-google-fonts/cinzel/600SemiBold';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppMusic } from '@/components/app-music';
import { StartupVideo } from '@/components/startup-video';
import { GameProvider, useGame } from '@/state/GameProvider';
import { AudioProvider, useAppAudio } from '@/state/AudioProvider';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync().catch((error) => console.warn('Não foi possível manter a tela de abertura.', error));

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AudioProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </AudioProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const [loaded, error] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });
  const [introHeld, setIntroHeld] = useState(false);
  const [musicReady, setMusicReady] = useState(false);
  const [musicError, setMusicError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { ready: audioReady } = useAppAudio();
  const { ready: gameReady } = useGame();
  const appReady = (loaded || error) && audioReady && gameReady && musicReady && !musicError;
  const showIntro = !introHeld || !appReady;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch((error) => console.warn('Não foi possível configurar o fundo do sistema.', error));
  }, []);

  const hideSplash = useCallback(() => {
    void SplashScreen.hideAsync().catch((error) => console.warn('Não foi possível ocultar a tela de abertura.', error));
  }, []);

  const finishIntro = useCallback(() => {
    setIntroHeld(true);
  }, []);

  const finishMusic = useCallback(() => setMusicReady(true), []);
  const failMusic = useCallback(() => setMusicError(true), []);
  const retryMusic = useCallback(() => {
    setMusicError(false);
    setMusicReady(false);
    setAttempt((current) => current + 1);
  }, []);

  return (
    <>
      <StatusBar style="light" hidden={showIntro} />
      {!showIntro ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        />
      ) : null}
      {showIntro ? <StartupVideo onReady={hideSplash} onFinish={finishIntro} loadError={musicError} onRetry={retryMusic} /> : null}
      <AppMusic introVisible={showIntro} attempt={attempt} onReady={finishMusic} onError={failMusic} />
    </>
  );
}
