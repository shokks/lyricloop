import { useCallback, useState } from 'react';
import {
  requestRecordingPermissionsAsync,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { Platform } from 'react-native';

import type { RecordingState } from '@/types';

export function useRecording() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetAudioMode = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        interruptionMode: 'mixWithOthers',
        playsInSilentMode: true,
      });
    } catch {}
  }, []);

  const startRecording = useCallback(async () => {
    if (recordingState === 'recording') {
      return false;
    }

    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      setErrorMessage('Microphone permission is required to record.');
      return false;
    }

    const startWithMode = async (interruptionMode: 'mixWithOthers' | 'duckOthers') => {
      await setAudioModeAsync({
        allowsRecording: true,
        interruptionMode,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
    };

    try {
      await startWithMode('mixWithOthers');
      setRecordingUri(null);
      setErrorMessage(null);
      setRecordingState('recording');

      return true;
    } catch {
      if (Platform.OS === 'android') {
        try {
          await startWithMode('duckOthers');
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
  }, [recorder, recordingState]);

  const stopRecording = useCallback(async () => {
    if (!recorder.isRecording && recordingState !== 'recording') {
      return null;
    }

    try {
      await recorder.stop();

      const status = recorder.getStatus();
      const uri = recorder.uri ?? status.url ?? null;
      setRecordingUri(uri ?? null);
      setRecordingState('stopped');
      setErrorMessage(null);

      await resetAudioMode();

      return uri;
    } catch {
      setErrorMessage('Could not stop recording. Please try again.');
      return null;
    }
  }, [recorder, recordingState, resetAudioMode]);

  const resetRecording = useCallback(() => {
    void resetAudioMode();

    setRecordingUri(null);
    setErrorMessage(null);
    setRecordingState('idle');
  }, [resetAudioMode]);

  return {
    errorMessage,
    recordingState,
    recordingUri,
    resetRecording,
    startRecording,
    stopRecording,
  };
}
