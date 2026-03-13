import { useFocusEffect } from '@react-navigation/native';
import { type Href, Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette } from '@/constants/theme';
import { getSongs, saveSong } from '@/lib/storage';
import type { ScrollSpeed } from '@/types';

type SongEditorScreenProps = {
  songId?: string;
};

export function SongEditorScreen({ songId }: SongEditorScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [scrollSpeed, setScrollSpeed] = useState<ScrollSpeed>('medium');
  const [isLoading, setIsLoading] = useState(Boolean(songId));
  const [isMissingSong, setIsMissingSong] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const stableSongId = useRef(songId ?? `song-${Date.now()}`);
  const createdAtRef = useRef<string | null>(null);
  const lyricsRef = useRef<TextInput>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 0 = preview mode, 1 = edit mode
  const modeAnim = useRef(new Animated.Value(0)).current;

  // Load existing song
  useEffect(() => {
    if (!songId) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    void (async () => {
      const songs = await getSongs();
      const song = songs.find((s) => s.id === songId);

      if (!mounted) return;

      if (!song) {
        setIsMissingSong(true);
        setIsLoading(false);
        return;
      }

      setName(song.name);
      setLyrics(song.lyrics);
      setScrollSpeed(song.scrollSpeed);
      createdAtRef.current = song.createdAt;
      stableSongId.current = song.id;
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [songId]);

  // Keyboard mode transitions
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = () => {
      setIsEditing(true);
      Animated.timing(modeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    };

    const onHide = () => {
      setIsEditing(false);
      Animated.timing(modeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [modeAnim]);

  // Auto-save
  const doSave = useCallback(async (n: string, l: string, s: ScrollSpeed) => {
    if (!createdAtRef.current) {
      createdAtRef.current = new Date().toISOString();
    }
    await saveSong({
      id: stableSongId.current,
      name: n.trim() || 'Untitled song',
      lyrics: l,
      scrollSpeed: s,
      createdAt: createdAtRef.current,
    });
  }, []);

  const scheduleSave = useCallback(
    (n: string, l: string, s: ScrollSpeed) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => void doSave(n, l, s), 400);
    },
    [doSave]
  );

  // Flush save when leaving the screen
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        void doSave(name, lyrics, scrollSpeed);
      };
    }, [doSave, name, lyrics, scrollSpeed])
  );

  const handleNameChange = (text: string) => {
    setName(text);
    scheduleSave(text, lyrics, scrollSpeed);
  };

  const handleLyricsChange = (text: string) => {
    setLyrics(text);
    scheduleSave(name, text, scrollSpeed);
  };

  const handleRecord = useCallback(async () => {
    if (!lyrics.trim()) return;
    Keyboard.dismiss();
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    await doSave(name, lyrics, scrollSpeed);
    router.push(`/song/record/${stableSongId.current}` as Href);
  }, [doSave, lyrics, name, router, scrollSpeed]);

  const editLayerOpacity = modeAnim;
  const previewLayerOpacity = modeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  const hasLyrics = lyrics.trim().length > 0;
  const bottomInset = Math.max(insets.bottom, 16);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
      </View>
    );
  }

  if (isMissingSong) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: '' }} />
        <View style={styles.centered}>
          <Text style={styles.missingText}>Song not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <Stack.Screen options={{ title: name.trim() || 'New Song' }} />

      {/* Song name */}
      <TextInput
        blurOnSubmit={false}
        onChangeText={handleNameChange}
        onSubmitEditing={() => lyricsRef.current?.focus()}
        placeholder="Song name..."
        placeholderTextColor={Palette.textSecondary}
        returnKeyType="next"
        style={styles.nameInput}
        value={name}
      />

      <View style={styles.divider} />

      {/* Lyrics area — crossfade between edit (DM-Sans) and Lora preview */}
      <View style={styles.lyricsContainer}>
        <Animated.View
          pointerEvents={isEditing ? 'auto' : 'none'}
          style={[StyleSheet.absoluteFill, { opacity: editLayerOpacity }]}>
          <TextInput
            multiline
            onChangeText={handleLyricsChange}
            placeholder="Paste or type your lyrics..."
            placeholderTextColor={Palette.textDisabled}
            ref={lyricsRef}
            scrollEnabled
            style={styles.lyricsEditInput}
            textAlignVertical="top"
            value={lyrics}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={isEditing ? 'none' : 'auto'}
          style={[StyleSheet.absoluteFill, { opacity: previewLayerOpacity }]}>
          <Pressable onPress={() => lyricsRef.current?.focus()} style={StyleSheet.absoluteFill}>
            <ScrollView
              contentContainerStyle={styles.lyricsPreviewContent}
              showsVerticalScrollIndicator={false}>
              <Text style={lyrics ? styles.lyricsPreviewText : styles.lyricsPreviewPlaceholder}>
                {lyrics || 'Tap to add lyrics...'}
              </Text>
            </ScrollView>
          </Pressable>
        </Animated.View>
      </View>

      {/* Done bar — visible when keyboard is up */}
      {isEditing && (
        <View style={styles.doneBar}>
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}
            onPress={() => Keyboard.dismiss()}
            style={styles.doneButtonPressable}>
            <Text style={styles.doneButtonLabel}>Done</Text>
          </Pressable>
        </View>
      )}

      {/* Record CTA */}
      <Pressable
        disabled={!hasLyrics}
        onPress={() => void handleRecord()}
        style={[
          styles.recordCta,
          !hasLyrics && styles.recordCtaDisabled,
          { paddingBottom: isEditing ? 8 : bottomInset + 8 },
        ]}>
        <Text style={[styles.recordCtaText, !hasLyrics && styles.recordCtaTextDisabled]}>
          Record →
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.background,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  missingText: {
    color: Palette.textSecondary,
    fontFamily: 'DM-Sans',
    fontSize: 16,
  },
  nameInput: {
    color: Palette.textPrimary,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  divider: {
    backgroundColor: Palette.border,
    height: StyleSheet.hairlineWidth,
  },
  lyricsContainer: {
    flex: 1,
  },
  lyricsEditInput: {
    color: Palette.textPrimary,
    flex: 1,
    fontFamily: 'DM-Sans',
    fontSize: 16,
    lineHeight: 26,
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  lyricsPreviewContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  lyricsPreviewText: {
    color: Palette.textPrimary,
    fontFamily: 'Lora',
    fontSize: 22,
    lineHeight: 37,
  },
  lyricsPreviewPlaceholder: {
    color: Palette.textSecondary,
    fontFamily: 'Lora',
    fontSize: 22,
    lineHeight: 37,
  },
  doneBar: {
    alignItems: 'flex-end',
    borderTopColor: Palette.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  doneButtonPressable: {
    paddingHorizontal: 4,
  },
  doneButtonLabel: {
    color: Palette.accent,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 16,
  },
  recordCta: {
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderTopColor: Palette.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    paddingTop: 16,
  },
  recordCtaDisabled: {
    opacity: 0.35,
  },
  recordCtaText: {
    color: Palette.accent,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 17,
  },
  recordCtaTextDisabled: {
    color: Palette.textDisabled,
  },
});
