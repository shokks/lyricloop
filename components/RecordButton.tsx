import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import type { RecordingState } from '@/types';

type RecordButtonProps = {
  recordingState: RecordingState;
  onStart: () => void;
  onStop: () => void;
};

export function RecordButton({ recordingState, onStart, onStop }: RecordButtonProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (recordingState !== 'recording') {
      pulse.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { duration: 450, toValue: 1.07, useNativeDriver: true }),
        Animated.timing(pulse, { duration: 450, toValue: 1, useNativeDriver: true }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      pulse.setValue(1);
    };
  }, [pulse, recordingState]);

  const isRecording = recordingState === 'recording';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isRecording ? 'Stop recording' : 'Start recording'}
      onPress={isRecording ? onStop : onStart}
      style={styles.wrapper}>
      <Animated.View style={[styles.button, isRecording ? styles.recordingButton : undefined, { transform: [{ scale: pulse }] }]}>
        <Feather color="#FFFFFF" name={isRecording ? 'square' : 'mic'} size={28} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  recordingButton: {
    backgroundColor: '#B91C1C',
  },
});
