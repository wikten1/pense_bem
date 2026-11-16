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
import { GameProvider } from '@/state/GameProvider';
import { AudioProvider } from '@/state/AudioProvider';
import { colors } from '@/theme/tokens';

void SplashScreen.preventAutoHideAsync().catch((error) => console.warn('Não foi possível manter a tela de abertura.', error));

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Cinzel_400Regular,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
  });
  const [introHeld, setIntroHeld] = useState(false);
  const appReady = loaded || error;
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

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AudioProvider>
        {appReady ? (
          <GameProvider>
            <StatusBar style="light" hidden={showIntro} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'fade',
              }}
            />
          </GameProvider>
        ) : null}
        {showIntro ? <StartupVideo onReady={hideSplash} onFinish={finishIntro} /> : null}
        <AppMusic introVisible={showIntro} />
      </AudioProvider>
    </GestureHandlerRootView>
  );
}
