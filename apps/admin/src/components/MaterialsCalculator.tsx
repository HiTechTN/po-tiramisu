import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { RawMaterialRequirement } from '@potiramisu/shared';
import { theme } from '../theme';

interface MaterialsCalculatorProps {
  onCalculate: (date: string) => void;
  materials: RawMaterialRequirement[];
  loading: boolean;
}

export function MaterialsCalculator({ onCalculate, materials, loading }: MaterialsCalculatorProps) {
  const [targetDate, setTargetDate] = useState('');

  return (
    <Animated.View entering={FadeInUp.springify()} style={styles.container}>
      <Text style={styles.label}>Target Date (YYYY-MM-DD):</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={targetDate}
          onChangeText={setTargetDate}
          placeholder="2024-06-25"
          placeholderTextColor={theme.textMuted}
        />
        <TouchableOpacity
          style={styles.buttonPrimary}
          onPress={() => onCalculate(targetDate)}
          disabled={loading || !targetDate}
        >
          <Text style={styles.buttonText}>{loading ? '...' : 'Calculate'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={materials}
        keyExtractor={item => item.ingredient_name}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(index * 100)} style={styles.materialRow}>
            <Text style={styles.materialName}>{item.ingredient_name}</Text>
            <Text style={styles.materialQty}>{item.total_quantity} {item.unit}</Text>
          </Animated.View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No materials to calculate or no orders on this date.</Text>}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: {
    color: theme.textMain,
    marginBottom: 10,
    fontSize: 15,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: theme.cardBg,
    color: theme.textMain,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    fontSize: 16,
  },
  buttonPrimary: {
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.cardBorder,
  },
  materialName: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '500',
  },
  materialQty: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: {
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
