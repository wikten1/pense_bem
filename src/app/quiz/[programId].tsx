import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnswerChoice, BackLink, GoldButton, NightScreen, Panel } from '@/components/game/ui';
import { QuestionIllustration } from '@/components/game/question-illustration';
import { ProgramScreen } from '@/components/game/program-screen';
import { findProgram, MAX_ATTEMPTS, sessionStats, type ChoiceId } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function QuizScreen() {
  const { programId: rawId } = useLocalSearchParams<{ programId: string }>();
  const programId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { ready, session, answer, review, next, saveError } = useGame();
  const program = programId ? findProgram(programId) : undefined;
  const active = session && session.programId === programId ? session : null;
  const question = active?.quiz[active.index];
  const state = question && active ? active.questions[question.id] : undefined;

  function choose(choiceId: ChoiceId) {
    if (question && active) answer(choiceId, question.id, active.id);
  }

  function advance() {
    if (!question || !active) return;
    const finished = next(question.id, active.id);
    if (finished && programId) {
      router.replace({ pathname: '/results/[programId]', params: { programId, celebrate: programId === 'p1' || programId === 'p2' || programId === 'p3' || programId === 'p4' || programId === 'p5' || programId === 'p6' ? '1' : '0' } });
    }
  }

  if (!ready) {
    return <NightScreen><Text style={styles.body}>Recuperando sua partida…</Text></NightScreen>;
  }

  if (!active || !question || !state || !program) {
    return (
      <NightScreen>
        <BackLink label="Programas" onPress={() => router.replace('/programs')} />
        <Text style={styles.prompt}>Não há uma partida deste programa em andamento.</Text>
        <GoldButton label="Voltar aos programas" onPress={() => router.replace('/programs')} />
      </NightScreen>
    );
  }

  const stats = sessionStats(active);
  const last = active.index === active.quiz.length - 1;
  const unavailable = !question.correctChoiceId;
  const attemptsLeft = MAX_ATTEMPTS - state.attemptsUsed;
  const message = state.pending
    ? '◇ Pendência registrada. Esta pergunta não conta como erro.'
    : state.correct
      ? `✓ Certa resposta! +${state.points} ${state.points === 1 ? 'ponto' : 'pontos'}.`
      : state.finished
        ? '× As três tentativas acabaram. Esta pergunta vale 0 pontos.'
        : state.attemptsUsed
          ? `× Resposta incorreta. ${attemptsLeft === 1 ? 'Resta 1 tentativa' : `Restam ${attemptsLeft} tentativas`}.`
          : unavailable ? null : 'Escolha uma alternativa. Você tem três tentativas.';
  const correctAnswer = question.choices.find((choice) => choice.id === question.correctChoiceId);

  return (
    <ProgramScreen programId={programId}>
      <View style={styles.top}>
        <BackLink label="Pausar" onPress={() => router.replace('/')} />
        <Text style={styles.program}>{program.title}</Text>
      </View>
      <View style={styles.hud}>
        <Text style={styles.counter}>
          {String(active.index + 1).padStart(2, '0')}/{String(active.quiz.length).padStart(2, '0')}
        </Text>
        <Text style={styles.hudText}>Pontos {stats.score}</Text>
        <Text style={styles.hudText}>
          Tentativas {unavailable ? '—' : Math.max(attemptsLeft, 0)}
        </Text>
      </View>
      <ScrollView key={`${active.id}-${question.id}`} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {saveError ? <Text accessibilityRole="alert" style={styles.feedbackBad}>{saveError}</Text> : null}
        <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: stats.total, now: stats.finished }} accessibilityLabel="Perguntas percorridas" style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${stats.finished / stats.total * 100}%` }]} />
        </View>
        {question.sourcePage ? <Text style={styles.caption}>Questão {question.number} da revista · Página {question.sourcePage}</Text> : null}
        {question.context ? (
          <Panel>
            <Text style={styles.caption}>Leia antes de responder</Text>
            <Text style={styles.context}>{question.context}</Text>
          </Panel>
        ) : null}
        <Text accessibilityRole="header" style={styles.prompt}>{question.prompt}</Text>
        {question.illustration ? <QuestionIllustration key={question.id} illustration={question.illustration} /> : null}
        {unavailable ? (
          <Panel>
            <Text style={styles.caption}>Conteúdo pendente de revisão</Text>
            <Text style={styles.body}>{question.reviewNotes}</Text>
            <Text style={styles.body}>Consulte as alternativas abaixo e avance sem perder pontos.</Text>
          </Panel>
        ) : null}
        <View style={styles.choices}>
          {question.choices.map((choice) => {
            const wrong = state.wrongChoices.includes(choice.id);
            const correct = state.chosenCorrect === choice.id;
            const locked = unavailable || (state.finished && !wrong && !correct);
            const visual = wrong ? 'wrong' : correct ? 'correct' : locked ? 'locked' : 'idle';
            return (
              <AnswerChoice
                key={choice.id}
                choiceId={choice.id}
                label={choice.text}
                colorOnly={['aladdin-15', 'aladdin-16', 'aladdin-45', 'aladdin-46', 'aladdin-47', 'aladdin-48', 'aladdin-49', 'aladdin-50', 'aladdin-51', 'aladdin-61', 'aladdin-80', 'aladdin-81', 'aladdin-82', 'aladdin-83', 'aladdin-84', 'aladdin-85', 'aladdin-86', 'aladdin-112', 'aladdin-113', 'aladdin-114', 'aladdin-115', 'aladdin-116', 'aladdin-117', 'aladdin-118', 'aladdin-119', 'aladdin-120'].includes(question.id)}
                state={visual}
                onPress={() => choose(choice.id)}
              />
            );
          })}
        </View>
        {message ? (
          <Text accessibilityLiveRegion="polite" style={[styles.feedback, state.correct || state.pending ? styles.feedbackOk : styles.feedbackBad]}>
            {message}
          </Text>
        ) : null}
        {state.finished && !unavailable && (!state.correct || question.answerBasis) ? (
          <Panel>
            {!state.correct ? <Text style={styles.caption}>Resposta correta: {correctAnswer?.text}</Text> : null}
            {question.answerBasis ? <Text style={styles.body}>{question.answerBasis}</Text> : null}
          </Panel>
        ) : null}
        {unavailable && !state.finished ? (
          <GoldButton label="Registrar pendência e continuar" onPress={() => {
            review(question.id, active.id);
            advance();
          }} />
        ) : null}
        {state.finished ? (
          <GoldButton label={last ? 'Ver resultado' : 'Próxima pergunta'} onPress={advance} />
        ) : null}
      </ScrollView>
    </ProgramScreen>
  );
}

const styles = StyleSheet.create({
  top: {
    gap: space.xs,
  },
  program: {
    color: colors.gold,
    fontFamily: fonts.cinzelSemi,
    fontSize: 16,
  },
  hud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.sm,
    marginVertical: space.md,
  },
  counter: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelBold,
    fontSize: 22,
  },
  hudText: {
    color: colors.text,
    fontSize: 14,
  },
  scroll: {
    gap: space.md,
    paddingBottom: space.xl,
  },
  prompt: {
    color: colors.text,
    fontFamily: fonts.cinzel,
    fontSize: 22,
    lineHeight: 32,
  },
  choices: {
    gap: space.sm,
  },
  feedback: {
    fontFamily: fonts.cinzelSemi,
    fontSize: 16,
    lineHeight: 22,
  },
  feedbackOk: {
    color: colors.goldLight,
  },
  feedbackBad: {
    color: colors.accentPink,
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  context: {
    color: colors.text,
    fontFamily: fonts.cinzel,
    fontSize: 16,
    lineHeight: 26,
  },
  caption: {
    color: colors.goldLight,
    fontFamily: fonts.cinzelSemi,
    fontSize: 13,
    lineHeight: 20,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold,
  },
});
