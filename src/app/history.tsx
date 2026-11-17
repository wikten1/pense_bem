import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { BackLink, GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { HistoryEntryCard } from '@/components/game/history-entry';
import { IntroBackground, useScreenViewport } from '@/components/intro-background';
import { PASSWORD_NOTE } from '@/game/rules';
import { passwordFeedback as messages } from '@/game/password-feedback';
import type { HistoryEntry } from '@/storage/game-save';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

const renderEntry = ({ item }: { item: HistoryEntry }) => <HistoryEntryCard entry={item} />;
const entryKey = (entry: HistoryEntry) => entry.id;

export default function HistoryScreen() {
  const { viewport, onLayout } = useScreenViewport();
  const { ready, saveError, history, notaDesafio, ledger, redeem } = useGame();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  function submit() {
    if (!ready) return;
    const result = redeem(code);
    if (!result.ok) {
      setFeedback(messages[result.reason]);
      return;
    }
    setFeedback(result.replaced ? messages.replaced : messages.ok);
    setCode('');
  }

  return (
    <NightScreen backdrop={<IntroBackground viewport={viewport} />} onLayout={onLayout}>
      <BackLink label="Início" onPress={() => router.back()} />
      <FlatList
        data={history}
        renderItem={renderEntry}
        keyExtractor={entryKey}
        initialNumToRender={8}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.body}>{ready ? 'Nenhuma partida concluída ainda.' : 'Recuperando progresso…'}</Text>}
        ListHeaderComponent={
          <View style={styles.header}>
            {saveError ? <Text accessibilityRole="alert" style={styles.body}>{saveError}</Text> : null}
            <Text style={styles.kicker}>Nota Desafio</Text>
            <Text style={styles.score}>{notaDesafio}</Text>
            <Text style={styles.body}>{PASSWORD_NOTE}</Text>

            <Panel>
              <Text style={styles.cardTitle}>Resgatar senha</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                onSubmitEditing={submit}
                returnKeyType="done"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="AL190308"
                placeholderTextColor="#7E86A3"
                style={styles.input}
                accessibilityLabel="Senha"
              />
              <GoldButton label="Resgatar" onPress={submit} disabled={!ready || code.trim().length === 0} />
              {feedback ? <Text accessibilityLiveRegion="polite" style={styles.body}>{feedback}</Text> : null}
              <Text style={styles.meta}>
                {ledger.codes.length === 1 ? '1 senha resgatada' : `${ledger.codes.length} senhas resgatadas`}
              </Text>
            </Panel>

            <Text style={styles.cardTitle}>Histórico</Text>
          </View>
        }
      />
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.md },
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
