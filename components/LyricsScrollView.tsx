import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAutoScroll } from '@/lib/useAutoScroll';
import type { ScrollSpeed } from '@/types';

type LyricsScrollViewProps = {
  lyrics: string;
  scrollSpeed: ScrollSpeed;
  onReRecord?: () => void;
  showReRecordButton?: boolean;
};

export function LyricsScrollView({
  lyrics,
  scrollSpeed,
  onReRecord,
  showReRecordButton = true,
}: LyricsScrollViewProps) {
  const {
    estimatedDurationMs,
    isPaused,
    isScrolling,
    onContentSizeChange,
    onLayout,
    onScroll,
    pauseScroll,
    resetScroll,
    resumeScroll,
    scrollViewRef,
    startScroll,
    stopScroll,
  } = useAutoScroll({ lyrics, scrollSpeed });

  const [didAutoStart, setDidAutoStart] = useState(false);

  useEffect(() => {
    resetScroll();
    setDidAutoStart(false);
  }, [lyrics, scrollSpeed, resetScroll]);

  const handleTogglePause = () => {
    if (isPaused) {
      resumeScroll();
      return;
    }

    if (!isScrolling) {
      startScroll();
      return;
    }

    pauseScroll();
  };

  const handleReRecord = () => {
    resetScroll();
    onReRecord?.();
  };

  const handleContentSizeChange = (width: number, height: number) => {
    onContentSizeChange(width, height);

    if (didAutoStart) {
      return;
    }

    const started = startScroll();

    if (started) {
      setDidAutoStart(true);
    }
  };

  const handleLayout = (event: Parameters<typeof onLayout>[0]) => {
    onLayout(event);

    if (didAutoStart) {
      return;
    }

    const started = startScroll();

    if (started) {
      setDidAutoStart(true);
    }
  };

  useEffect(() => {
    return () => {
      stopScroll();
    };
  }, [stopScroll]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <ThemedText type="defaultSemiBold">Auto-scroll preview</ThemedText>
        <ThemedText style={styles.durationText}>{Math.round(estimatedDurationMs / 1000)}s</ThemedText>
      </View>

      <Pressable onPress={handleTogglePause} style={styles.lyricsFrame}>
        <ScrollView
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          onScroll={onScroll}
          ref={scrollViewRef}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}>
          <ThemedText style={styles.lyricsText}>{lyrics || 'Add lyrics to start the teleprompter.'}</ThemedText>
        </ScrollView>

        {isPaused ? (
          <View style={styles.pausedBadge}>
            <ThemedText style={styles.pausedLabel}>⏸ Paused</ThemedText>
          </View>
        ) : null}
      </Pressable>

      {showReRecordButton ? (
        <Pressable onPress={handleReRecord} style={styles.reRecordButton}>
          <ThemedText style={styles.reRecordButtonLabel}>Re-record</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  durationText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 18,
  },
  lyricsFrame: {
    borderColor: '#D1D5DB',
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  lyricsText: {
    fontSize: 30,
    lineHeight: 40,
    paddingBottom: 220,
  },
  pausedBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    top: 12,
  },
  pausedLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  reRecordButton: {
    alignItems: 'center',
    backgroundColor: '#0A7EA4',
    borderRadius: 10,
    marginTop: 12,
    paddingVertical: 12,
  },
  reRecordButtonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
