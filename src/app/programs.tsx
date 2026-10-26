import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackLink, GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { IntroBackground, useScreenViewport } from '@/components/intro-background';
import { ALADDIN_PROGRAMS, PRACTICE_PROGRAM, findProgramByEntryCode } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function ProgramsScreen() {
  const { bestScore, history, startProgram, session } = useGame();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const { viewport, onLayout } = useScreenViewport();

  function openProgram(programId: string) {
    if (session?.status === 'in_progress' && session.programId === programId) {
      router.push({ pathname: '/quiz/[programId]', params: { programId } });
      return;
    }
    if (startProgram(programId)) {
      router.push({ pathname: '/quiz/[programId]', params: { programId } });
      return;
    }
    setFeedback('As perguntas deste programa ainda não estão disponíveis.');
  }

  function confirmCode() {
    const program = findProgramByEntryCode(code);
    if (!program) {
      setFeedback('Código não encontrado. Use um dos códigos da lista, como 041.');
      return;
    }
    setFeedback(null);
    openProgram(program.id);
  }

  return (
    <NightScreen backdrop={<IntroBackground viewport={viewport} />} onLayout={onLayout}>
      <BackLink label="Início" onPress={() => router.replace('/')} />
      <Text style={styles.title}>Programas</Text>
      <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Panel>
          <Text style={styles.cardTitle}>Código do livro</Text>
          <Text style={styles.body}>Digite o código do programa que você quer jogar.</Text>
          <TextInput
            value={code}
            onChangeText={(value) => {
              setCode(value);
              setFeedback(null);
            }}
            onSubmitEditing={confirmCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="041"
            placeholderTextColor="#7E86A3"
            returnKeyType="done"
            style={styles.input}
            accessibilityLabel="Código do livro"
          />
          <GoldButton label="Confirmar código" onPress={confirmCode} disabled={code.trim().length === 0} />
          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}
        </Panel>

        <Panel>
          <Text style={styles.cardTitle}>Livro 04</Text>
          {ALADDIN_PROGRAMS.map((program, index) => {
            const best = bestScore(program.id);
            const done = history.some((item) => item.programId === program.id && !item.pending);
            return (
              <View key={program.id} style={[styles.programRow, index === 0 && styles.programRowFirst]}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{program.number}</Text>
                </View>
                <View style={styles.programCopy}>
                  <View style={styles.row}>
                    <Text style={styles.programTitle}>{program.title}</Text>
                    {done ? <Text style={styles.badge}>Concluído</Text> : null}
                  </View>
                  <Text style={styles.code}>{program.entryCode.join('  ·  ')}</Text>
                  <Text style={styles.meta}>{best === null ? 'Sem pontuação' : `Melhor pontuação: ${best}`}</Text>
                </View>
              </View>
            );
          })}
        </Panel>

        <Panel>
          <Text style={styles.cardTitle}>{PRACTICE_PROGRAM.title}</Text>
          <Text style={styles.body}>{PRACTICE_PROGRAM.notes}</Text>
          <GoldButton label="Jogar o treino" onPress={() => openProgram(PRACTICE_PROGRAM.id)} variant="secondary" />
        </Panel>
      </ScrollView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 32,
    marginBottom: space.md,
  },
  list: {
    gap: space.md,
    paddingBottom: space.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.cinzelSemi,
    fontSize: 20,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  feedback: {
    color: colors.goldLight,
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.backgroundDeep,
    color: colors.text,
    fontFamily: fonts.cinzelSemi,
    fontSize: 18,
    paddingHorizontal: space.md,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingVertical: space.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  programRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },
  number: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: colors.textOnGold,
    fontFamily: fonts.cinzelBold,
    fontSize: 16,
  },
  programCopy: {
    flex: 1,
    gap: 2,
  },
  programTitle: {
    color: colors.text,
    fontFamily: fonts.cinzelSemi,
    fontSize: 16,
    flex: 1,
  },
  badge: {
    color: colors.textOnGold,
    backgroundColor: colors.gold,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontFamily: fonts.cinzelSemi,
  },
  code: {
    color: colors.goldLight,
    fontFamily: fonts.cinzel,
    fontSize: 13,
  },
  meta: {
    color: colors.bronze,
    fontSize: 13,
  },
});
