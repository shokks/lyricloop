import { useLocalSearchParams } from 'expo-router';

import { RecordingScreen } from '@/components/RecordingScreen';

export default function SongRecordScreen() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const songId = Array.isArray(id) ? id[0] : (id ?? '');

  return <RecordingScreen songId={songId} />;
}
