import { Cinzel_400Regular, Cinzel_600SemiBold, Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StartupVideo } from '@/components/startup-video';
import { GameProvider } from '@/state/GameProvider';
import { colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

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
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  const hideSplash = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  const finishIntro = useCallback(() => {
    setIntroHeld(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
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
    </GestureHandlerRootView>
  );
}
