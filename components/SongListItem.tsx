import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/constants/theme';
import type { Song } from '@/types';

type SongListItemProps = {
  song: Song;
  onDelete: (id: string) => void;
  onPress: (id: string) => void;
};

function formatDate(createdAt: string): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLyricsPreview(lyrics: string): string {
  const firstLine = lyrics.split('\n').find((line) => line.trim().length > 0) ?? '';
  return firstLine.length > 60 ? firstLine.slice(0, 60) + '\u2026' : firstLine;
}

export function SongListItem({ song, onDelete, onPress }: SongListItemProps) {
  const preview = getLyricsPreview(song.lyrics);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => onPress(song.id)} style={styles.content}>
        <Text numberOfLines={1} style={styles.title}>
          {song.name || 'Untitled song'}
        </Text>
        {preview ? (
          <Text numberOfLines={1} style={styles.preview}>
            {preview}
          </Text>
        ) : null}
        <Text style={styles.date}>{formatDate(song.createdAt)}</Text>
      </Pressable>

      <Pressable
        accessibilityLabel={`Delete ${song.name || 'song'}`}
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => onDelete(song.id)}
        style={styles.deleteButton}>
        <Feather color={Palette.textDisabled} name="trash-2" size={16} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderBottomColor: Palette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 64,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
    gap: 3,
    marginRight: 12,
  },
  title: {
    color: Palette.textPrimary,
    fontFamily: 'DM-Sans-SemiBold',
    fontSize: 16,
    lineHeight: 22,
  },
  preview: {
    color: Palette.textSecondary,
    fontFamily: 'DM-Sans',
    fontSize: 13,
    lineHeight: 18,
  },
  date: {
    color: Palette.textDisabled,
    fontFamily: 'DM-Sans',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  deleteButton: {
    borderRadius: 20,
    padding: 8,
  },
});
