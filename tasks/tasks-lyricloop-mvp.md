# Tasks: LyricLoop MVP

**PRD:** [prd-lyricloop-mvp.md](./prd-lyricloop-mvp.md)  
**Created:** 2026-03-13

---

## Relevant Files

- `app/index.tsx` - Song Library screen (list of saved songs + "New Song" button)
- `app/song/new.tsx` - Song Screen for a brand new unsaved song
- `app/song/[id].tsx` - Song Screen for an existing saved song
- `types/index.ts` - Shared TypeScript types (Song, ScrollSpeed, RecordingState)
- `lib/storage.ts` - AsyncStorage CRUD helpers for the song library
- `lib/useRecording.ts` - Custom hook wrapping expo-av recording logic
- `lib/useAutoScroll.ts` - Custom hook for Animated scroll engine
- `components/SongListItem.tsx` - Single row in the song library list
- `components/LyricsScrollView.tsx` - Animated ScrollView that displays scrolling lyrics
- `components/SpeedSlider.tsx` - Scroll speed control (slow / medium / fast)
- `components/RecordButton.tsx` - Large record/stop button with visual state changes
- `components/PostRecordingView.tsx` - Playback + share + re-record controls shown after stop
- `app.json` - Expo config (microphone permission strings)

### Notes

- No automated tests for MVP — validate manually on a real device.
- All state is local; no backend, no auth, no network calls.
- Always test audio session behaviour (Spotify not pausing) on a **real device**, not the simulator.

---

## Instructions for Completing Tasks

As you complete each task, check it off by changing `- [ ]` to `- [x]`. Update after each sub-task, not just each parent task.

---

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Run `git init` in the project root (already done by create-expo-app), then `git checkout -b feature/lyricloop-mvp` (~5 min)

- [ ] 1.0 Install dependencies & configure project
  - [ ] 1.1 Install `expo-av`: `npx expo install expo-av` (~10 min)
  - [ ] 1.2 Install `expo-sharing`: `npx expo install expo-sharing` (~5 min)
  - [ ] 1.3 Install `@react-native-async-storage/async-storage`: `npx expo install @react-native-async-storage/async-storage` (~5 min)
  - [ ] 1.4 Add microphone permission strings to `app.json` under `ios.infoPlist` (`NSMicrophoneUsageDescription`) and `android.permissions` (`RECORD_AUDIO`) (~15 min)
  - [ ] 1.5 Create `types/index.ts` with shared types: `Song` (id, name, lyrics, scrollSpeed, createdAt), `ScrollSpeed` (`'slow' | 'medium' | 'fast'`), `RecordingState` (`'idle' | 'recording' | 'stopped'`) (~15 min)
  - [ ] 1.6 Verify: `npx expo start` runs without errors; all packages resolve (~10 min)

- [ ] 2.0 Build local song library (storage layer + library screen)
  - [ ] 2.1 Create `lib/storage.ts` with AsyncStorage helpers: `getSongs()`, `saveSong(song)`, `deleteSong(id)` — songs stored as a JSON array under a single key (~30 min)
  - [ ] 2.2 Create `components/SongListItem.tsx` — shows song name + created date, swipe-to-delete or a delete icon button (~30 min)
  - [ ] 2.3 Build `app/index.tsx` as the library screen: fetch songs on mount, render a `FlatList` of `SongListItem`, show an empty-state message ("No songs yet — tap + to start") when list is empty (~45 min)
  - [ ] 2.4 Add a prominent "+" button in the header that navigates to `/song/new` (~15 min)
  - [ ] 2.5 Wire delete: call `deleteSong(id)` then refresh the list (~15 min)
  - [ ] 2.6 Verify: create a song manually in storage, confirm it appears in the list; delete it and confirm it disappears; empty state shows for new users (~15 min)

- [ ] 3.0 Build Song Screen UI (lyrics editor + scroll speed + save)
  - [ ] 3.1 Create `app/song/new.tsx` and `app/song/[id].tsx` — the `[id]` route loads the existing song from storage on mount; both share the same UI structure (~30 min)
  - [ ] 3.2 Add a song name `TextInput` at the top of the Song Screen (~15 min)
  - [ ] 3.3 Add a multiline `TextInput` for lyrics that fills the available vertical space (~20 min)
  - [ ] 3.4 Create `components/SpeedSlider.tsx` — a 3-step control (Slow / Medium / Fast) using a `Slider` or three tappable buttons; default to Medium (~30 min)
  - [ ] 3.5 Add a "Save" button that calls `saveSong()` with current name + lyrics + speed; navigate back to library after save (~20 min)
  - [ ] 3.6 Hide the speed slider and name/lyrics inputs when `recordingState !== 'idle'` (screen switches to teleprompter mode during recording) (~15 min)
  - [ ] 3.7 Verify: type lyrics, set speed, save — song appears in library; open saved song — name/lyrics/speed restored correctly (~15 min)

- [ ] 4.0 Implement auto-scroll engine
  - [ ] 4.1 Create `lib/useAutoScroll.ts` — returns `scrollViewRef`, `startScroll(durationMs)`, `pauseScroll()`, `resumeScroll()`, `resetScroll()` (~45 min)
  - [ ] 4.2 Calculate scroll duration from lyrics character count and selected speed: Slow = ~60 wpm equivalent, Medium = ~90 wpm, Fast = ~120 wpm; compute total pixel height to scroll and derive duration accordingly (~30 min)
  - [ ] 4.3 Create `components/LyricsScrollView.tsx` — renders lyrics in a large readable font inside a `ScrollView` driven by the hook; tap anywhere on the lyrics area to toggle pause/resume (~45 min)
  - [ ] 4.4 Show a subtle "⏸ Paused" badge overlaid on the lyrics when scrolling is paused (~15 min)
  - [ ] 4.5 Call `resetScroll()` when user taps "Re-record" to snap back to the top (~10 min)
  - [ ] 4.6 Verify: scroll starts when recording starts, pauses/resumes on tap, resets on re-record; test all three speed settings feel appropriately paced (~20 min)

- [ ] 5.0 Implement audio recording with correct iOS/Android audio session
  - [ ] 5.1 Create `lib/useRecording.ts` — wraps `expo-av` `Audio.Recording`; exposes `startRecording()`, `stopRecording()` (returns URI), `recordingState` (~45 min)
  - [ ] 5.2 Inside `startRecording()`, call `Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true, interruptionModeIOS: InterruptionModeIOS.MixWithOthers, interruptionModeAndroid: InterruptionModeAndroid.DoNotMix })` **before** starting the recording — this is the critical iOS fix (~20 min)
  - [ ] 5.3 Request mic permission (`Audio.requestPermissionsAsync()`) on first tap of record; show an error message if denied (~20 min)
  - [ ] 5.4 Create `components/RecordButton.tsx` — large circular button; idle = red mic icon, recording = pulsing red stop icon; calls `startRecording` / `stopRecording` on press (~30 min)
  - [ ] 5.5 Wire `RecordButton` to `useAutoScroll`: `startRecording` → `startScroll`, `stopRecording` → stop scroll and transition to post-recording view (~20 min)
  - [ ] 5.6 Verify **on a real device**: start Spotify, open LyricLoop, tap record — confirm Spotify keeps playing; stop — confirm a recording URI exists (~20 min)

- [ ] 6.0 Build post-recording screen (playback + share + re-record)
  - [ ] 6.1 Create `components/PostRecordingView.tsx` — shown in place of the record button after `stopRecording`; contains Play, Share, and Re-record buttons (~30 min)
  - [ ] 6.2 Implement playback: use `Audio.Sound.createAsync(uri)` + `sound.playAsync()` / `sound.stopAsync()`; show a playing indicator while audio is playing (~30 min)
  - [ ] 6.3 Implement share: call `Sharing.shareAsync(uri)` to open the native OS share sheet with the `.m4a` file (~20 min)
  - [ ] 6.4 Implement re-record: stop any playback, unload sound, clear the recording URI, reset scroll position, return to idle state (~20 min)
  - [ ] 6.5 Verify: playback plays the recorded audio; share sheet opens with the file and it can be sent via iMessage/WhatsApp; re-record resets the screen cleanly (~20 min)

- [ ] 7.0 Wire navigation end-to-end and validate full user flow
  - [ ] 7.1 Ensure first-time users (no saved songs) land directly on `/song/new` instead of an empty library — redirect in `app/index.tsx` if `songs.length === 0` (~15 min)
  - [ ] 7.2 Ensure the back button from Song Screen goes to the library without losing unsaved lyrics (prompt "Save before leaving?" or auto-save draft) (~20 min)
  - [ ] 7.3 Walk through the full happy path on device: open app → paste lyrics → set speed → tap record → sing → tap stop → play back → share → re-record → save song → find it in library (~20 min)
  - [ ] 7.4 Test with Spotify playing throughout — confirm it never pauses at any point in the flow (~15 min)
  - [ ] 7.5 Fix any layout issues on small screens (iPhone SE) and confirm text is readable in dark conditions (~20 min)
  - [ ] 7.6 Verify all PRD success metrics: 3 flows completed without confusion, Spotify stays active, saved song reopens correctly, share works end-to-end (~15 min)
