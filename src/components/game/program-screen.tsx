import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { NightScreen } from '@/components/game/ui';

const backgrounds: Partial<Record<string, number>> = {
  practice: require('../../../assets/images/modulo_treino.jpg'),
  p1: require('../../../assets/images/aladdin-quiz-background.jpg'),
  p2: require('../../../assets/images/abu-quiz-background.jpg'),
  p3: require('../../../assets/images/sultao.jpg'),
  p4: require('../../../assets/images/jasmine-quiz-background.png'),
  p5: require('../../../assets/images/iago-quiz-background.png'),
  p6: require('../../../assets/images/genie-quiz-background.png'),
};

export function ProgramScreen({ children, programId }: { children: ReactNode; programId?: string }) {
  const source = programId ? backgrounds[programId] : undefined;

  return (
    <NightScreen backdrop={source ? (
      <>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.scrim} />
      </>
    ) : undefined}>
      {children}
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 18, 49, 0.68)',
  },
});
