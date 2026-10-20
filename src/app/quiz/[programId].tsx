import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnswerChoice, BackLink, GoldButton, NightScreen } from '@/components/game/ui';
import { findProgram, MAX_ATTEMPTS, type ChoiceId } from '@/game/rules';
import { useGame } from '@/state/GameProvider';
import { colors, fonts, space } from '@/theme/tokens';

export default function QuizScreen() {
  const { programId: rawId } = useLocalSearchParams<{ programId: string }>();
  const programId = Array.isArray(rawId) ? rawId[0] : rawId;
  const { session, answer, next } = useGame();
  const [message, setMessage] = useState<string | null>(null);
  const program = programId ? findProgram(programId) : undefined;
  const active = session && session.programId === programId ? session : null;
  const question = active?.quiz[active.index];
  const state = question && active ? active.questions[question.id] : undefined;

  function choose(choiceId: ChoiceId) {
    const event = answer(choiceId);
    if (!event) {
      return;
    }
    if (event.type === 'correct') {
      setMessage(event.points === 1 ? 'Certa resposta. 1 ponto.' : `Certa resposta. ${event.points} pontos.`);
    } else if (event.type === 'incorrect') {
      setMessage(`Resposta incorreta. Resta ${event.attemptsLeft === 1 ? '1 tentativa' : `${event.attemptsLeft} tentativas`}.`);
    } else if (event.type === 'failed') {
      setMessage('As três tentativas acabaram. Esta pergunta vale 0 pontos.');
    }
  }

  function advance() {
    const finished = next();
    setMessage(null);
    if (finished && programId) {
      router.replace({ pathname: '/results/[programId]', params: { programId } });
    }
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

  const score = active.quiz.reduce((sum, item) => sum + (active.questions[item.id]?.points ?? 0), 0);
  const last = active.index === active.quiz.length - 1;

  return (
    <NightScreen>
      <View style={styles.top}>
        <BackLink label="Pausar" onPress={() => router.replace('/')} />
        <Text style={styles.program}>{program.title}</Text>
      </View>
      <View style={styles.hud}>
        <Text style={styles.counter}>
          {String(active.index + 1).padStart(2, '0')}/{String(active.quiz.length).padStart(2, '0')}
        </Text>
        <Text style={styles.hudText}>Pontos {score}</Text>
        <Text style={styles.hudText}>
          Tentativas {Math.max(MAX_ATTEMPTS - state.attemptsUsed, 0)}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.prompt}>{question.prompt}</Text>
        <View style={styles.choices}>
          {question.choices.map((choice) => {
            const wrong = state.wrongChoices.includes(choice.id);
            const correct = state.chosenCorrect === choice.id;
            const locked = state.finished && !wrong && !correct;
            const visual = wrong ? 'wrong' : correct ? 'correct' : locked ? 'locked' : 'idle';
            return (
              <AnswerChoice
                key={choice.id}
                choiceId={choice.id}
                label={choice.text}
                state={visual}
                onPress={() => choose(choice.id)}
              />
            );
          })}
        </View>
        {message || state.finished ? (
          <Text style={[styles.feedback, state.correct ? styles.feedbackOk : styles.feedbackBad]}>
            {message ?? (state.correct ? `Certa resposta. ${state.points} pontos.` : 'Tentativas esgotadas. 0 pontos.')}
          </Text>
        ) : null}
        {state.finished ? (
          <GoldButton label={last ? 'Ver resultado' : 'Próxima pergunta'} onPress={advance} />
        ) : null}
      </ScrollView>
    </NightScreen>
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
});
