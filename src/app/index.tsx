import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { findProgram, SCORING_NOTE } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function HomeScreen() {
  const { ready, persistent, session, notaDesafio, history } = useGame();
  const current = session?.status === 'in_progress' ? findProgram(session.programId) : undefined;

  return (
    <NightScreen background="image">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Pense Bem</Text>
        <Text style={styles.subtitle}>Aladdin</Text>
        <Text style={styles.lead}>Os Mistérios do Oriente</Text>

        <Panel>
          <Text style={styles.panelTitle}>Nota Desafio</Text>
          <Text style={styles.score}>{ready ? notaDesafio : '—'}</Text>
          <Text style={styles.meta}>{history.length === 1 ? '1 partida registrada' : `${history.length} partidas registradas`}</Text>
        </Panel>

        <View style={styles.actions}>
          {current && session ? (
            <GoldButton
              label={`Continuar ${current.title} · ${String(session.index + 1).padStart(2, '0')}/${String(session.quiz.length).padStart(2, '0')}`}
              onPress={() => router.push({ pathname: '/quiz/[programId]', params: { programId: session.programId } })}
            />
          ) : null}
          <GoldButton label="Escolher programa" onPress={() => router.push('/programs')} variant={current ? 'secondary' : 'primary'} />
          <GoldButton label="Resultados e Nota Desafio" onPress={() => router.push('/history')} variant="secondary" />
        </View>

        <Text style={styles.note}>{SCORING_NOTE}</Text>
        {ready && !persistent ? (
          <Text style={styles.note}>
            Este build ainda não grava a partida ao fechar o aplicativo. Recompile o app de desenvolvimento para ativar o armazenamento local.
          </Text>
        ) : null}
      </ScrollView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: space.md,
    paddingBottom: space.md,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.cinzelBold,
    fontSize: 42,
    lineHeight: 48,
  },
  subtitle: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 36,
    lineHeight: 42,
  },
  lead: {
    color: colors.text,
    fontSize: 16,
    marginBottom: space.sm,
  },
  panelTitle: {
    color: colors.gold,
    fontFamily: fonts.cinzelSemi,
    fontSize: 14,
  },
  score: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 40,
    lineHeight: 46,
  },
  meta: {
    color: colors.text,
    fontSize: 14,
  },
  actions: {
    gap: space.sm,
  },
  note: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
});
