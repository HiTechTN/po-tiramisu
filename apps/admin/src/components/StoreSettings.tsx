import React from 'react';
import { StyleSheet, Text, View, Switch } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { theme } from '../theme';

interface StoreSettingsProps {
  isStoreClosed: boolean;
  onToggle: (value: boolean) => void;
  loading: boolean;
}

export function StoreSettings({ isStoreClosed, onToggle, loading }: StoreSettingsProps) {
  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.container}>
      <Text style={styles.settingsHeader}>Store Operations</Text>
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Close Store for Today</Text>
        <Switch
          value={isStoreClosed}
          onValueChange={onToggle}
          disabled={loading}
          trackColor={{ false: theme.cardBorder, true: theme.primary }}
          thumbColor={theme.textMain}
        />
      </View>
      <Text style={styles.helperText}>
        When enabled, customers will not be able to select today as a delivery date.
        The store status is persisted in the database.
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  settingsHeader: {
    color: theme.textMain,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.cardBg,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  settingText: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    color: theme.textMuted,
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
});
