import { Feather } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, withOpacity } from '@/constants/theme';

type PostRecordingViewProps = {
  recordingUri: string | null;
  onDone: () => void;
  onReRecord: () => void;
  songName: string;
};

function formatDuration(seconds: number): string {
  if (!seconds || !Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const BAR_COUNT = 56;

function buildWaveform(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = i / BAR_COUNT;
    const h =
      0.5 +
      0.28 * Math.sin(t * Math.PI * 7) +
      0.14 * Math.sin(t * Math.PI * 17) +
      0.08 * Math.sin(t * Math.PI * 37);
    return Math.max(0.08, Math.min(1, h));
  });
}

export function PostRecordingView({ recordingUri, onDone, onReRecord, songName }: PostRecordingViewProps) {
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer();
  const playerStatus = useAudioPlayerStatus(player);

  const webAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isWebPlaying, setIsWebPlaying] = useState(false);
  const [webDuration, setWebDuration] = useState(0);
  const [webCurrentTime, setWebCurrentTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [waveformWidth, setWaveformWidth] = useState(0);

  const waveformHeights = useMemo(() => buildWaveform(), []);

  useEffect(() => {
    if (Platform.OS === 'web' || !recordingUri) return;
    player.replace(recordingUri);
  }, [player, recordingUri]);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    setIsWebPlaying(false);
    setWebDuration(0);
    setWebCurrentTime(0);

    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current = null;
    }

    if (!recordingUri) {
      return;
    }

    const audio = new Audio(recordingUri);
    audio.preload = 'auto';

    const onLoadedMetadata = () => {
      setWebDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onTimeUpdate = () => {
      setWebCurrentTime(audio.currentTime || 0);
    };
    const onPlay = () => setIsWebPlaying(true);
    const onPause = () => setIsWebPlaying(false);
    const onEnded = () => {
      setIsWebPlaying(false);
      setWebCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.load();

    webAudioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);

      if (webAudioRef.current === audio) {
        webAudioRef.current = null;
      }
    };
  }, [recordingUri]);

  const handlePlayPress = useCallback(async () => {
    if (!recordingUri) { setErrorMessage('No recording available yet.'); return; }
    try {
      setErrorMessage(null);
      if (Platform.OS === 'web') {
        const webAudio = webAudioRef.current;
        if (!webAudio) { setErrorMessage('No recording available yet.'); return; }
        if (isWebPlaying) {
          webAudio.pause();
          webAudio.currentTime = 0;
          setWebCurrentTime(0);
          return;
        }

        if (webAudio.duration && webAudio.currentTime >= webAudio.duration - 0.01) {
          webAudio.currentTime = 0;
          setWebCurrentTime(0);
        }

        await webAudio.play();
        return;
      }
      if (playerStatus.playing) { player.pause(); await player.seekTo(0); return; }
      if (playerStatus.didJustFinish) await player.seekTo(0);
      player.play();
    } catch {
      setErrorMessage('Could not play the recording.');
    }
  }, [isWebPlaying, player, playerStatus.didJustFinish, playerStatus.playing, recordingUri]);

  const handleSharePress = useCallback(async () => {
    if (!recordingUri) { setErrorMessage('No recording available yet.'); return; }
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) { setErrorMessage('Sharing is not available on this device.'); return; }
    setErrorMessage(null);
    await Sharing.shareAsync(recordingUri);
  }, [recordingUri]);

  const handleReRecord = useCallback(async () => {
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current.currentTime = 0;
      setIsWebPlaying(false);
      setWebCurrentTime(0);
    }
    try {
      player.pause();
      await player.seekTo(0);
    } catch {}

    setErrorMessage(null);
    onReRecord();
  }, [onReRecord, player]);

  const handleDone = useCallback(async () => {
    if (webAudioRef.current) {
      webAudioRef.current.pause();
      webAudioRef.current.currentTime = 0;
      setIsWebPlaying(false);
      setWebCurrentTime(0);
    }

    try {
      player.pause();
      await player.seekTo(0);
    } catch {}

    setErrorMessage(null);
    onDone();
  }, [onDone, player]);

  const isPlaying = Platform.OS === 'web' ? isWebPlaying : playerStatus.playing;
  const duration = Platform.OS === 'web' ? webDuration : playerStatus.duration;
  const currentTime = Platform.OS === 'web' ? webCurrentTime : playerStatus.currentTime;
  const playProgress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  const MAX_BAR_HEIGHT = 48;

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) },
      ]}>

      <View style={styles.topRow}>
        <Text numberOfLines={1} style={styles.songName}>
          {songName || 'Untitled song'}
        </Text>

        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
          onPress={() => void handleDone()}
          style={styles.doneAction}>
          <Text style={styles.doneActionLabel}>Done</Text>
        </Pressable>
      </View>

      {/* Waveform + duration — vertically centered in remaining space */}
      <View style={styles.middleSection}>
        <View
          onLayout={(e: LayoutChangeEvent) => setWaveformWidth(e.nativeEvent.layout.width)}
          style={styles.waveformContainer}>
          {waveformHeights.map((h, i) => (
            <View
              key={i}
              style={[styles.waveformBar, { height: Math.max(2, h * MAX_BAR_HEIGHT) }]}
            />
          ))}
          {waveformWidth > 0 && (
            <View style={[styles.playhead, { left: playProgress * waveformWidth }]} />
          )}
        </View>
        <Text style={styles.duration}>{formatDuration(duration)}</Text>
      </View>

      {/* Action row — Re-record | Play | Share */}
      <View style={styles.actionRow}>
        <Pressable
          hitSlop={{ top: 16, bottom: 16, left: 20, right: 8 }}
          onPress={() => void handleReRecord()}
          style={styles.textAction}>
          <Text style={styles.textActionLabel}>Re-record</Text>
        </Pressable>

        <Pressable onPress={() => void handlePlayPress()} style={styles.playButton}>
          <Feather color={Palette.textPrimary} name={isPlaying ? 'square' : 'play'} size={28} />
        </Pressable>

        <Pressable
          hitSlop={{ top: 16, bottom: 16, left: 8, right: 20 }}
          onPress={() => void handleSharePress()}
          style={styles.textAction}>
          <Text style={styles.textActionLabel}>Share</Text>
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.background,
    flex: 1,
    paddingHorizontal: 24,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  songName: {
    color: Palette.textPrimary,
    flex: 1,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 18,
    marginRight: 16,
  },
  doneAction: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  doneActionLabel: {
    color: Palette.accent,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 16,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
  },
  waveformContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    height: 64,
    overflow: 'visible',
    position: 'relative',
  },
  waveformBar: {
    backgroundColor: withOpacity(Palette.accent, 0.4),
    borderRadius: 1,
    flex: 1,
    marginHorizontal: 0.5,
  },
  playhead: {
    backgroundColor: Palette.accent,
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: 1.5,
  },
  duration: {
    color: Palette.textSecondary,
    fontFamily: 'DM-Sans',
    fontSize: 13,
    marginTop: 8,
  },
  actionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  textAction: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  textActionLabel: {
    color: Palette.textSecondary,
    fontFamily: 'DM-Sans',
    fontSize: 16,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  errorText: {
    color: Palette.recordRed,
    fontFamily: 'DM-Sans',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
});
