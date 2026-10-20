import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChoiceId } from '@/game/rules';
import { colors, fonts, space } from '@/theme/tokens';

export function NightScreen({
  children,
  background,
}: {
  children: ReactNode;
  background?: 'image' | 'gradient';
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.fill}>
      {background === 'image' ? (
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
      )}
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
    <Pressable
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
    </Pressable>
  );
}

const keyColors: Record<ChoiceId, string> = {
  red: colors.keyRed,
  yellow: colors.keyYellow,
  blue: colors.keyBlue,
  green: colors.keyGreen,
};

export function AnswerChoice({
  choiceId,
  label,
  state,
  onPress,
}: {
  choiceId: ChoiceId;
  label: string;
  state: 'idle' | 'wrong' | 'correct' | 'locked';
  onPress: () => void;
}) {
  const disabled = state !== 'idle';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.answer,
        state === 'wrong' && styles.answerWrong,
        state === 'correct' && styles.answerCorrect,
        state === 'locked' && styles.answerLocked,
        pressed && state === 'idle' && styles.pressed,
      ]}>
      <View style={[styles.pip, { backgroundColor: keyColors[choiceId] }]} />
      <Text style={[styles.answerText, state === 'wrong' && styles.answerTextWrong]}>{label}</Text>
    </Pressable>
  );
}

export function BackLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" hitSlop={12} onPress={onPress} style={styles.back}>
      <Text style={styles.backText}>{label}</Text>
    </Pressable>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
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
    width: 22,
    height: 22,
    borderRadius: 6,
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
