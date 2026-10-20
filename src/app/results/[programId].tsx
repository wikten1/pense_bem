import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { PASSWORD_NOTE, buildQuiz, findProgram } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function ResultsScreen() {
  const { programId: rawId } = useLocalSearchParams<{ programId: string }>();
  const programId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { history, ledger, notaDesafio, redeem, startProgram } = useGame();
  const entry = history.find((item) => item.programId === programId);
  const program = programId ? findProgram(programId) : undefined;
  const canReplay = programId ? buildQuiz(programId, 1) !== null : false;
  const redeemed = entry?.password ? ledger.codes.includes(entry.password) : false;

  function playAgain() {
    if (programId && startProgram(programId)) {
      router.replace({ pathname: '/quiz/[programId]', params: { programId } });
    }
  }

  return (
    <NightScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Resultado</Text>
        <Text style={styles.title}>{entry?.programTitle ?? program?.title ?? 'Programa'}</Text>
        {entry ? (
          <Panel>
            <Text style={styles.score}>
              {entry.score}
              <Text style={styles.scoreMax}> / {entry.maxScore}</Text>
            </Text>
            <View style={styles.grid}>
              <Stat label="Acertadas" value={String(entry.correct)} />
              <Stat label="Não acertadas" value={String(entry.missed)} />
              <Stat label="Aproveitamento" value={`${entry.percent}%`} />
            </View>
            {entry.password ? (
              <>
                <Text style={styles.label}>Senha desta partida</Text>
                <Text style={styles.password}>{entry.password}</Text>
                <Text style={styles.body}>{redeemed ? 'Esta senha já entrou na Nota Desafio.' : 'Ainda não resgatada.'}</Text>
                <GoldButton
                  label={redeemed ? 'Senha já utilizada' : 'Usar senha na Nota Desafio'}
                  disabled={redeemed}
                  onPress={() => redeem(entry.password!)}
                />
              </>
            ) : (
              <Text style={styles.body}>O treino não gera senha. A senha só existe para um programa da revista concluído com 30 perguntas.</Text>
            )}
            <Text style={styles.label}>Nota Desafio</Text>
            <Text style={styles.nota}>{notaDesafio}</Text>
            <Text style={styles.body}>{PASSWORD_NOTE}</Text>
          </Panel>
        ) : (
          <Text style={styles.body}>Ainda não há um resultado salvo para este programa.</Text>
        )}
        {canReplay ? <GoldButton label="Jogar novamente" onPress={playAgain} variant="secondary" /> : null}
        <GoldButton label="Voltar aos programas" onPress={() => router.replace('/programs')} variant="secondary" />
      </ScrollView>
    </NightScreen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: space.md,
    paddingBottom: space.xl,
  },
  kicker: {
    color: colors.gold,
    fontFamily: fonts.cinzelSemi,
    letterSpacing: 1,
  },
  title: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 34,
    lineHeight: 40,
  },
  score: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 48,
    lineHeight: 54,
  },
  scoreMax: {
    fontSize: 22,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    gap: space.sm,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.backgroundDeep,
    borderRadius: 14,
    padding: space.sm,
    minHeight: 72,
    justifyContent: 'center',
  },
  statValue: {
    color: colors.text,
    fontFamily: fonts.cinzelBold,
    fontSize: 20,
  },
  statLabel: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
  },
  label: {
    color: colors.gold,
    fontFamily: fonts.cinzelSemi,
    marginTop: space.sm,
  },
  password: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 28,
    letterSpacing: 1,
  },
  nota: {
    color: colors.text,
    fontFamily: fonts.cinzelBold,
    fontSize: 28,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
});
