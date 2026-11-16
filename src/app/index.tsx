import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GoldButton, NightScreen } from '@/components/game/ui';
import { IntroBackground, LOGO_BOTTOM, useScreenViewport, videoFrame, type Viewport } from '@/components/intro-background';
import { findProgram } from '@/game/rules';
import { downloadBook } from '@/services/downloadBook';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

function HomeLead({ viewport }: { viewport: Viewport }) {
  const insets = useSafeAreaInsets();
  const frame = videoFrame(viewport.width, viewport.height);
  const top = Math.max(insets.top + space.sm, frame.top + LOGO_BOTTOM * frame.height + space.md);

  return (
    <Text style={[styles.lead, { top }]} pointerEvents="none">
      Os Mistérios do Oriente
    </Text>
  );
}

export default function HomeScreen() {
  const { ready, persistent, session, saveError } = useGame();
  const current = session?.status === 'in_progress' ? findProgram(session.programId) : undefined;
  const { viewport, onLayout } = useScreenViewport();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const downloadLock = useRef(false);

  async function handleDownload() {
    if (downloadLock.current) return;
    downloadLock.current = true;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadBook();
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Não foi possível baixar o livro. Tente novamente.');
    } finally {
      downloadLock.current = false;
      setDownloading(false);
    }
  }

  return (
    <NightScreen backdrop={<IntroBackground viewport={viewport} />} overlay={viewport ? <HomeLead viewport={viewport} /> : null} onLayout={onLayout}>
      <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.actions}>
          {current && session ? (
            <GoldButton
              label={`Continuar ${current.title} · ${String(session.index + 1).padStart(2, '0')}/${String(session.quiz.length).padStart(2, '0')}`}
              onPress={() => router.push({ pathname: '/quiz/[programId]', params: { programId: session.programId } })}
            />
          ) : null}
          <GoldButton label="Escolher programa" onPress={() => router.push('/programs')} variant={current ? 'secondary' : 'primary'} />
          <GoldButton label="Resultados e Nota Desafio" onPress={() => router.push('/history')} variant="secondary" />
          <GoldButton
            label={downloading ? 'Preparando livro…' : 'Baixar livro em PDF'}
            onPress={() => void handleDownload()}
            disabled={downloading}
            variant="secondary"
          />
          <Text style={styles.note}>
            Consulte as páginas e ilustrações do livro de Aladdin para responder às perguntas. No celular, escolha onde salvar ou compartilhar o PDF.
          </Text>
          {downloadError ? <Text accessibilityRole="alert" style={styles.note}>{downloadError}</Text> : null}
        </View>

        {saveError ? <Text accessibilityRole="alert" style={styles.note}>{saveError}</Text> : null}
        {!ready ? <Text accessibilityLiveRegion="polite" style={styles.note}>Recuperando progresso…</Text> : null}
        {ready && !persistent && !saveError ? (
          <Text style={styles.note}>
            O armazenamento local não está disponível. Seu progresso ficará disponível apenas enquanto o aplicativo estiver aberto.
          </Text>
        ) : null}
      </ScrollView>
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: space.md,
  },
  lead: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    zIndex: 1,
    color: colors.goldLight,
    fontFamily: fonts.cinzel,
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(14, 20, 50, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
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
