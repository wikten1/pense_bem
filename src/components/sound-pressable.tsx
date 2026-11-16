import { Pressable, type PressableProps } from 'react-native';

import { useAppAudio, type ButtonSound } from '@/state/AudioProvider';

export function SoundPressable({ sound = 'tap', onPress, disabled, ...props }: PressableProps & { sound?: ButtonSound }) {
  const { playSound } = useAppAudio();
  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={(event) => {
        if (disabled) return;
        if (onPress) {
          playSound(sound);
          onPress(event);
        }
      }}
    />
  );
}
