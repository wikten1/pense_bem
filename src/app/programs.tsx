import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BackLink, GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { ALADDIN_PROGRAMS, CONTENT_GAP, PRACTICE_PROGRAM, auditAladdin } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function ProgramsScreen() {
  const { bestScore, history, startProgram, session } = useGame();
  const issues = auditAladdin();

  function openProgram(programId: string, available: boolean) {
    if (!available) {
      return;
    }
    if (session?.status === 'in_progress' && session.programId === programId) {
      router.push({ pathname: '/quiz/[programId]', params: { programId } });
      return;
    }
    if (startProgram(programId)) {
      router.push({ pathname: '/quiz/[programId]', params: { programId } });
    }
  }

  return (
    <NightScreen>
      <BackLink label="Início" onPress={() => router.back()} />
      <Text style={styles.title}>Programas</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        <Panel>
          <Text style={styles.cardTitle}>{PRACTICE_PROGRAM.title}</Text>
          <Text style={styles.body}>{PRACTICE_PROGRAM.notes}</Text>
          <GoldButton label="Jogar o treino" onPress={() => openProgram(PRACTICE_PROGRAM.id, true)} />
        </Panel>

        {ALADDIN_PROGRAMS.map((program) => {
          const best = bestScore(program.id);
          const done = history.some((item) => item.programId === program.id);
          return (
            <Panel key={program.id}>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>{program.title}</Text>
                {done ? <Text style={styles.badge}>Concluído</Text> : null}
              </View>
              <Text style={styles.code}>{program.entryCode.join('  ·  ')}</Text>
              <Text style={styles.body}>{program.notes}</Text>
              {program.sections.map((section) => (
                <Text key={section.title} style={styles.section}>
                  {section.from}–{section.to} {section.title}
                  {section.needsIllustration ? ' · depende de ilustração' : ''}
                </Text>
              ))}
              <Text style={styles.body}>{best === null ? 'Sem pontuação registrada' : `Melhor pontuação: ${best}`}</Text>
              <GoldButton label="Perguntas da revista indisponíveis" disabled onPress={() => openProgram(program.id, false)} />
            </Panel>
          );
        })}

        <Panel>
          <Text style={styles.cardTitle}>O que ficou de fora</Text>
          <Text style={styles.body}>{CONTENT_GAP}</Text>
          {issues.map((issue) => (
            <Text key={issue} style={styles.section}>
              {issue}
            </Text>
          ))}
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
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
