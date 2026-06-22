import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { Order } from '@potiramisu/shared';
import { theme } from '../theme';

interface OrderQueueProps {
  orders: Order[];
  onAdvanceStatus: (id: string, currentStatus: string) => void;
}

export function OrderQueue({ orders, onAdvanceStatus }: OrderQueueProps) {
  return (
    <FlatList
      data={orders}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInUp.delay(index * 100).springify()} exiting={FadeOutUp} layout={Layout.springify()}>
          <TouchableOpacity style={styles.card} onPress={() => onAdvanceStatus(item.id, item.status)} activeOpacity={0.7}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>#{item.id.split('-')[0].toUpperCase()}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.customerName}>{item.customer_name} • {item.customer_phone}</Text>
            <Text style={styles.date}>Delivery: {item.delivery_date}</Text>
            <Text style={styles.tapText}>Tap to advance status →</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No active orders.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.cardBg,
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    color: theme.primary,
    fontWeight: '900',
    fontSize: 18,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    backgroundColor: 'rgba(194, 136, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(194, 136, 89, 0.3)',
  },
  statusBadgeText: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  customerName: {
    color: theme.textMain,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  date: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: 14,
  },
  tapText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  emptyText: {
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
