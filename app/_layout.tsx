import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import {
  DMSans_400Regular,
  DMSans_600SemiBold,
  useFonts as useDMSansFonts,
} from '@expo-google-fonts/dm-sans';
import { Lora_400Regular, useFonts as useLoraFonts } from '@expo-google-fonts/lora';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { Palette, withOpacity } from '@/constants/theme';

// Resets on every cold app launch — does not persist across sessions
let splashShown = false;

const LyricLoopTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Palette.background,
    card: Palette.surface,
    text: Palette.textPrimary,
    border: Palette.border,
    notification: Palette.recordRed,
    primary: Palette.accent,
  },
};

function LandingOverlay({ onComplete }: { onComplete: () => void }) {
  const insets = useSafeAreaInsets();

  // Staged animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(12)).current;
  const ruleScaleX = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    splashShown = true;

    // Sequential reveal: background → title rises → rule draws → tagline → button
    Animated.sequence([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.timing(ruleScaleX, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(buttonOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [overlayOpacity, titleOpacity, titleY, ruleScaleX, taglineOpacity, buttonOpacity]);

  const handleEnter = useCallback(() => {
    Animated.sequence([
      Animated.timing(buttonScale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 0, duration: 650, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [buttonScale, overlayOpacity, onComplete]);

  const bottomPad = Math.max(insets.bottom, 24);

  return (
    <Animated.View style={[landing.container, { opacity: overlayOpacity }]}>
      {/* Layered ambient glow — like candlelight filling the room */}
      <View style={landing.glowOuter} />
      <View style={landing.glowInner} />

      {/* Spacer — pushes content above the mathematical center */}
      <View style={landing.topSpacer} />

      {/* Brand mark */}
      <Animated.Text
        style={[landing.title, { opacity: titleOpacity, transform: [{ translateY: titleY }] }]}>
        LyricLoop
      </Animated.Text>

      {/* Rule — draws itself from center outward */}
      <Animated.View style={[landing.ruleWrap, { transform: [{ scaleX: ruleScaleX }] }]}>
        <View style={landing.rule} />
      </Animated.View>

      {/* Tagline */}
      <Animated.Text style={[landing.tagline, { opacity: taglineOpacity }]}>
        your voice, your room.
      </Animated.Text>

      {/* Spacer — larger below content so it sits above center */}
      <View style={landing.bottomSpacer} />

      {/* CTA */}
      <Animated.View
        style={[landing.buttonWrap, { opacity: buttonOpacity, transform: [{ scale: buttonScale }] }]}>
        <Pressable onPress={handleEnter} style={landing.button}>
          <Text style={landing.buttonLabel}>Open my songs</Text>
        </Pressable>
      </Animated.View>

      <View style={{ height: bottomPad + 12 }} />
    </Animated.View>
  );
}

const landing = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: Palette.background,
    zIndex: 999,
  },
  // Outer halo — very faint, large
  glowOuter: {
    backgroundColor: withOpacity(Palette.accent, 0.028),
    borderRadius: 380,
    height: 760,
    position: 'absolute',
    top: '20%',
    width: 760,
  },
  // Inner warmth — smaller, slightly more present
  glowInner: {
    backgroundColor: withOpacity(Palette.accent, 0.062),
    borderRadius: 200,
    height: 400,
    position: 'absolute',
    top: '28%',
    width: 400,
  },
  topSpacer: {
    flex: 1,
  },
  title: {
    color: Palette.textPrimary,
    fontFamily: 'Lora',
    fontSize: 42,
    letterSpacing: 2,
    textAlign: 'center',
  },
  ruleWrap: {
    alignItems: 'center',
    marginVertical: 20,
  },
  rule: {
    backgroundColor: Palette.accent,
    height: 1.5,
    width: 40,
  },
  tagline: {
    color: Palette.textSecondary,
    fontFamily: 'DM-Sans',
    fontSize: 15,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  bottomSpacer: {
    flex: 1.4,
  },
  buttonWrap: {
    alignSelf: 'stretch',
    marginHorizontal: 32,
  },
  button: {
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderColor: Palette.accentMuted,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 18,
  },
  buttonLabel: {
    color: Palette.accent,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});

export default function RootLayout() {
  const [dmSansLoaded] = useDMSansFonts({
    'DM-Sans': DMSans_400Regular,
    'DM-Sans-SemiBold': DMSans_600SemiBold,
  });
  const [loraLoaded] = useLoraFonts({ Lora: Lora_400Regular });
  const [showLanding, setShowLanding] = useState(!splashShown);

  const handleLandingComplete = useCallback(() => {
    setShowLanding(false);
  }, []);

  if (!dmSansLoaded || !loraLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={LyricLoopTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Palette.surface },
          headerTitleStyle: { fontFamily: 'DM-Sans-SemiBold', color: Palette.textPrimary },
          headerTintColor: Palette.accent,
        }}>
        <Stack.Screen name="index" options={{ title: 'LyricLoop' }} />
        <Stack.Screen name="song/new" options={{ title: 'New Song' }} />
        <Stack.Screen name="song/[id]" options={{ title: 'Edit Song' }} />
        <Stack.Screen name="song/record/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
      {showLanding && <LandingOverlay onComplete={handleLandingComplete} />}
    </ThemeProvider>
  );
}
