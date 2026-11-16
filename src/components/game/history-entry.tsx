import { StyleSheet, Text } from 'react-native';

import { Panel } from '@/components/game/ui';
import type { HistoryEntry } from '@/storage/game-save';
import { colors, fonts } from '@/theme/tokens';

export function HistoryEntryCard({ entry }: { entry: HistoryEntry }) {
  return (
    <Panel>
      <Text accessibilityRole="header" style={styles.title}>{entry.programTitle}</Text>
      {entry.pending ? <Text style={styles.meta}>Resultado parcial · {entry.pending} pendentes de revisão</Text> : null}
      <Text style={styles.body}>
        {entry.score}/{entry.maxScore} pontos · {entry.correct} acertadas · {entry.missed} não acertadas · {entry.percent}%
      </Text>
      {entry.password ? <Text selectable style={styles.password}>{entry.password}</Text> : null}
      <Text style={styles.meta}>{new Date(entry.finishedAt).toLocaleString('pt-BR')}</Text>
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontFamily: fonts.cinzelSemi, fontSize: 18 },
  body: { color: colors.text, fontSize: 14, lineHeight: 20 },
  meta: { color: colors.bronze, fontSize: 13 },
  password: { color: colors.goldLight, fontFamily: fonts.cinzelBold, fontSize: 20 },
});
