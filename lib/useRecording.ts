import { useCallback, useRef, useState } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Platform } from 'react-native';

import type { RecordingState } from '@/types';

export function useRecording() {
  const recordingRef = useRef<Audio.Recording | null>(null);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    if (recordingState === 'recording') {
      return false;
    }

    const permission = await Audio.requestPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('Microphone permission is required to record.');
      return false;
    }

    const startWithMode = async (androidMode: InterruptionModeAndroid) => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeAndroid: androidMode,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      return recording;
    };

    try {
      let recording = await startWithMode(InterruptionModeAndroid.DoNotMix);

      if (Platform.OS === 'android' && !recording) {
        recording = await startWithMode(InterruptionModeAndroid.DuckOthers);
      }

      recordingRef.current = recording;
      setRecordingUri(null);
      setErrorMessage(null);
      setRecordingState('recording');

      return true;
    } catch {
      if (Platform.OS === 'android') {
        try {
          const fallbackRecording = await startWithMode(InterruptionModeAndroid.DuckOthers);

          recordingRef.current = fallbackRecording;
          setRecordingUri(null);
          setErrorMessage(null);
          setRecordingState('recording');

          return true;
        } catch {
          setErrorMessage('Could not start recording while other audio is playing.');
          setRecordingState('idle');
          return false;
        }
      }

      setErrorMessage('Could not start recording. Please try again.');
      setRecordingState('idle');
      return false;
    }
  }, [recordingState]);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;

    if (!recording) {
      return null;
    }

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      recordingRef.current = null;
      setRecordingUri(uri ?? null);
      setRecordingState('stopped');

      return uri;
    } catch {
      setErrorMessage('Could not stop recording. Please try again.');
      return null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    recordingRef.current = null;
    setRecordingUri(null);
    setErrorMessage(null);
    setRecordingState('idle');
  }, []);

  return {
    errorMessage,
    recordingState,
    recordingUri,
    resetRecording,
    startRecording,
    stopRecording,
  };
}
