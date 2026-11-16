import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChoiceId } from '@/game/rules';
import { SoundPressable } from '@/components/sound-pressable';
import { colors, fonts, space } from '@/theme/tokens';

export function NightScreen({
  children,
  background,
  backdrop,
  overlay,
  onLayout,
}: {
  children: ReactNode;
  background?: 'image' | 'gradient';
  backdrop?: ReactNode;
  overlay?: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.fill} onLayout={onLayout}>
      {backdrop ??
        (background === 'image' ? (
          <>
            <Image
              source={require('../../../assets/images/home-background.png')}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <View style={styles.imageScrim} />
          </>
        ) : (
          <>
            <View style={styles.nightFill} />
            <View style={styles.duskBand} />
          </>
        ))}
      {overlay}
      <View style={[styles.content, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.md }]}>
        {children}
      </View>
    </View>
  );
}

export function GoldButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <SoundPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.buttonWrap, pressed && !disabled && styles.pressed, disabled && styles.disabled]}>
      {variant === 'primary' ? (
        <View style={[styles.button, styles.primaryButton]}>
          <Text style={styles.buttonTextOnGold}>{label}</Text>
        </View>
      ) : (
        <View style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.buttonText}>{label}</Text>
        </View>
      )}
    </SoundPressable>
  );
}

const keyColors: Record<ChoiceId, string> = {
  red: colors.keyRed,
  yellow: colors.keyYellow,
  blue: colors.keyBlue,
  green: colors.keyGreen,
};
const keyLetters: Record<ChoiceId, string> = { red: 'A', yellow: 'B', blue: 'C', green: 'D' };
const squareColors: Record<ChoiceId, string> = {
  red: '#FA2C24',
  yellow: '#FDE121',
  blue: '#0769DE',
  green: '#05A03B',
};
const colorNames: Record<ChoiceId, string> = { red: 'vermelho', yellow: 'amarelo', blue: 'azul', green: 'verde' };

export function AnswerChoice({
  choiceId,
  label,
  state,
  onPress,
  colorOnly = false,
}: {
  choiceId: ChoiceId;
  label: string;
  state: 'idle' | 'wrong' | 'correct' | 'locked';
  onPress: () => void;
  colorOnly?: boolean;
}) {
  const disabled = state !== 'idle';
  const statusLabel = state === 'wrong' ? ', incorreta' : state === 'correct' ? ', correta' : '';
  return (
    <SoundPressable
      sound={choiceId}
      accessibilityRole="button"
      accessibilityLabel={`${colorOnly ? `Quadrado ${colorNames[choiceId]}` : keyLetters[choiceId]}. ${label}${statusLabel}`}
      accessibilityState={{ disabled, selected: state === 'wrong' || state === 'correct' }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.answer,
        state === 'wrong' && styles.answerWrong,
        state === 'correct' && styles.answerCorrect,
        state === 'locked' && styles.answerLocked,
        pressed && state === 'idle' && styles.pressed,
      ]}>
      <View style={[styles.pip, colorOnly && styles.colorSquare, { backgroundColor: colorOnly ? squareColors[choiceId] : keyColors[choiceId] }]}>
        {!colorOnly ? <Text style={styles.keyLetter}>{keyLetters[choiceId]}</Text> : null}
      </View>
      <Text style={[styles.answerText, state === 'wrong' && styles.answerTextWrong]}>{label}</Text>
      {state === 'wrong' || state === 'correct' ? <Text style={styles.answerStatus}>{state === 'correct' ? '✓' : '×'}</Text> : null}
    </SoundPressable>
  );
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <SoundPressable sound="back" accessibilityRole="button" hitSlop={12} onPress={onPress} style={styles.back}>
      <Text style={styles.backText}>{label}</Text>
    </SoundPressable>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  nightFill: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.background,
  },
  duskBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '46%',
    backgroundColor: colors.accentPurple,
    opacity: 0.9,
  },
  imageScrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(14,30,76,0.35)',
  },
  primaryButton: {
    backgroundColor: colors.gold,
  },
  content: {
    flex: 1,
    zIndex: 2,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: space.lg,
  },
  buttonWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 52,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: space.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  buttonText: {
    color: colors.textAccent,
    fontFamily: fonts.cinzelSemi,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonTextOnGold: {
    color: colors.textOnGold,
    fontFamily: fonts.cinzelBold,
    fontSize: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.86,
  },
  disabled: {
    opacity: 0.45,
  },
  answer: {
    minHeight: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  answerWrong: {
    borderColor: colors.accentPink,
    backgroundColor: '#3A2142',
  },
  answerCorrect: {
    borderColor: colors.goldBright,
    backgroundColor: '#3D3450',
  },
  answerLocked: {
    opacity: 0.7,
  },
  pip: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  keyLetter: {
    color: colors.backgroundDeep,
    fontWeight: '800',
    fontSize: 15,
  },
  colorSquare: {
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#000',
    flexShrink: 0,
  },
  answerStatus: {
    color: colors.text,
    fontSize: 22,
  },
  answerText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.cinzel,
    fontSize: 18,
    lineHeight: 26,
  },
  answerTextWrong: {
    textDecorationLine: 'line-through',
  },
  back: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  backText: {
    color: colors.goldLight,
    fontSize: 15,
  },
  panel: {
    backgroundColor: 'rgba(47,30,69,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.sm,
  },
});
