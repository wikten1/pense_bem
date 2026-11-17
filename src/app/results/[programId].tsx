import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GoldButton, Panel } from '@/components/game/ui';
import { ProgramScreen } from '@/components/game/program-screen';
import { CompletionVideo } from '@/components/completion-video';
import { PASSWORD_NOTE, findProgram } from '@/game/rules';
import { passwordFeedback } from '@/game/password-feedback';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function ResultsScreen() {
  const { programId: rawId, celebrate } = useLocalSearchParams<{ programId: string; celebrate?: string }>();
  const [showCelebration, setShowCelebration] = useState(celebrate === '1');
  const [feedback, setFeedback] = useState<string | null>(null);
  const programId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { ready, history, ledger, notaDesafio, redeem, startProgram, saveError } = useGame();
  const entry = history.find((item) => item.programId === programId);
  const program = programId ? findProgram(programId) : undefined;
  const canReplay = program !== undefined;
  const redeemed = entry?.password ? ledger.codes.includes(entry.password) : false;

  function playAgain() {
    if (programId && startProgram(programId)) {
      router.replace({ pathname: '/quiz/[programId]', params: { programId } });
    }
  }

  return (
    <ProgramScreen programId={programId}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{entry?.pending ? 'Resultado parcial' : 'Resultado'}</Text>
        <Text style={styles.title}>{entry?.programTitle ?? program?.title ?? 'Programa'}</Text>
        {saveError ? <Text accessibilityRole="alert" style={styles.body}>{saveError}</Text> : null}
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
            {entry.pending ? (
              <Text style={styles.body}>{entry.pending} perguntas pendentes de revisão, sem contar como erro. A pontuação e o aproveitamento consideram apenas as perguntas com resposta validada.</Text>
            ) : null}
            {entry.password ? (
              <>
                <Text style={styles.label}>Senha desta partida</Text>
                <Text selectable style={styles.password}>{entry.password}</Text>
                <Text style={styles.body}>{redeemed ? 'Esta senha já entrou na Nota Desafio.' : 'Ainda não resgatada.'}</Text>
                <GoldButton
                  label={redeemed ? 'Senha já utilizada' : 'Usar senha na Nota Desafio'}
                  disabled={redeemed}
                  onPress={() => {
                    const result = redeem(entry.password!);
                    setFeedback(result.ok ? passwordFeedback[result.replaced ? 'replaced' : 'ok'] : passwordFeedback[result.reason]);
                  }}
                />
                {feedback ? <Text accessibilityLiveRegion="polite" style={styles.body}>{feedback}</Text> : null}
              </>
            ) : (
              <Text style={styles.body}>{entry.pending ? 'Este resultado parcial não gera senha nem selo de programa concluído.' : 'O treino não gera senha. A senha só existe para um programa da revista concluído com 30 perguntas avaliadas.'}</Text>
            )}
            <Text style={styles.label}>Nota Desafio</Text>
            <Text style={styles.nota}>{notaDesafio}</Text>
            <Text style={styles.body}>{PASSWORD_NOTE}</Text>
          </Panel>
        ) : (
          <Text style={styles.body}>{ready ? 'Ainda não há um resultado salvo para este programa.' : 'Recuperando progresso…'}</Text>
        )}
        {canReplay ? <GoldButton label="Jogar novamente" disabled={!ready} onPress={playAgain} variant="secondary" /> : null}
        <GoldButton label="Voltar aos programas" onPress={() => router.replace('/programs')} variant="secondary" />
      </ScrollView>
      {ready && entry && showCelebration && (programId === 'p1' || programId === 'p2' || programId === 'p3' || programId === 'p4' || programId === 'p5' || programId === 'p6') ? (
        <CompletionVideo programId={programId} onFinish={() => setShowCelebration(false)} />
      ) : null}
    </ProgramScreen>
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
    flexWrap: 'wrap',
    gap: space.sm,
  },
  stat: {
    flex: 1,
    minWidth: 100,
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
