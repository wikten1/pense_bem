import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import { BackLink, GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { PASSWORD_NOTE } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

const messages = {
  invalid: 'Senha inválida. Confira o código.',
  duplicate: 'Esta senha já foi resgatada.',
  unknown_program: 'Esta senha não corresponde a um programa da revista.',
  not_higher: 'Já existe uma Nota Desafio igual ou maior neste programa.',
  ok: 'Senha resgatada.',
  replaced: 'A Nota Desafio deste programa foi atualizada para a pontuação maior.',
};

export default function HistoryScreen() {
  const { history, notaDesafio, ledger, redeem } = useGame();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit() {
    const result = redeem(code);
    if (!result.ok) {
      setFeedback(messages[result.reason]);
      return;
    }
    setFeedback(result.replaced ? messages.replaced : messages.ok);
    setCode('');
  }

  return (
    <NightScreen>
      <BackLink label="Início" onPress={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Nota Desafio</Text>
        <Text style={styles.score}>{notaDesafio}</Text>
        <Text style={styles.body}>{PASSWORD_NOTE}</Text>

        <Panel>
          <Text style={styles.cardTitle}>Resgatar senha</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="AL190308"
            placeholderTextColor="#7E86A3"
            style={styles.input}
            accessibilityLabel="Senha"
          />
          <GoldButton label="Resgatar" onPress={submit} disabled={code.trim().length === 0} />
          {feedback ? <Text style={styles.body}>{feedback}</Text> : null}
          <Text style={styles.meta}>
            {ledger.codes.length === 1 ? '1 senha resgatada' : `${ledger.codes.length} senhas resgatadas`}
          </Text>
        </Panel>

        <Text style={styles.cardTitle}>Histórico</Text>
        {history.length === 0 ? <Text style={styles.body}>Nenhuma partida concluída ainda.</Text> : null}
        {history.map((entry) => (
          <Panel key={entry.id}>
            <Text style={styles.cardTitle}>{entry.programTitle}</Text>
            {entry.pending ? <Text style={styles.meta}>Resultado parcial · {entry.pending} pendentes de revisão</Text> : null}
            <Text style={styles.body}>
              {entry.score}/{entry.maxScore} pontos · {entry.correct} acertadas · {entry.missed} não acertadas · {entry.percent}%
            </Text>
            {entry.password ? <Text style={styles.password}>{entry.password}</Text> : null}
            <Text style={styles.meta}>{new Date(entry.finishedAt).toLocaleString('pt-BR')}</Text>
          </Panel>
        ))}
      </ScrollView>
    </NightScreen>
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
  },
  score: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 56,
    lineHeight: 62,
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fonts.cinzelSemi,
    fontSize: 18,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    color: colors.bronze,
    fontSize: 13,
  },
  password: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 20,
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
});
