import { useEventListener } from 'expo';
import { useAudioPlayer, type AudioPlayer } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

const videoSources = {
  p1: require('../../assets/videos/aladin.mp4'),
  p2: require('../../assets/videos/abu.mp4'),
  p3: require('../../assets/videos/sultao.mp4'),
  p4: require('../../assets/videos/jasmini.mp4'),
  p5: require('../../assets/videos/iago.mp4'),
  p6: require('../../assets/videos/genio.mp4'),
};
const applauseSource = require('../../assets/audios/aplausos.mp3');

function loopAudio(player: AudioPlayer) {
  player.loop = true;
}

export function CompletionVideo({ programId, onFinish }: { programId: keyof typeof videoSources; onFinish: () => void }) {
  const finished = useRef(false);
  const applause = useAudioPlayer(applauseSource);
  const video = useVideoPlayer(videoSources[programId], (player) => {
    player.muted = true;
    player.loop = false;
  });

  function finish() {
    if (finished.current) return;
    finished.current = true;
    applause.pause();
    video.pause();
    onFinish();
  }

  useEventListener(video, 'playingChange', ({ isPlaying }) => {
    if (isPlaying) applause.play();
    else applause.pause();
  });
  useEventListener(video, 'playToEnd', finish);
  useEventListener(video, 'statusChange', ({ status }) => {
    if (status === 'error') finish();
  });

  useEffect(() => {
    loopAudio(applause);
    video.play();
    return () => {
      applause.pause();
      video.pause();
    };
  }, [applause, video]);

  return (
    <Modal visible animationType="fade" onRequestClose={finish}>
      <View style={styles.container}>
        <VideoView player={video} style={styles.video} contentFit="contain" nativeControls={false} playsInline />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
});
