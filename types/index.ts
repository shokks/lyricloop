export type ScrollSpeed = 'slow' | 'medium' | 'fast';

export type RecordingState = 'idle' | 'recording' | 'stopped';

export type Song = {
  id: string;
  name: string;
  lyrics: string;
  scrollSpeed: ScrollSpeed;
  createdAt: string;
};
